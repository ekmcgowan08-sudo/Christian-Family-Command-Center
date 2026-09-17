"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { sendVerificationForUser } from "@/lib/actions/email-verification";
import { checkIpRateLimit, checkRateLimit, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters.");
const nameSchema = z.string().trim().min(1, "Name is required.").max(80);

export type ActionResult = { error: string } | { success: true };

const newFamilySchema = z.object({
  familyName: z.string().trim().min(1, "Family name is required.").max(100),
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

/** Creates a brand-new Family plus its first OWNER user, then signs them in. */
export async function signupNewFamily(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getClientIp();
  const allowed = await checkIpRateLimit("signup", ip, { max: 100, windowMs: 60 * 60 * 1000 });
  if (!allowed) return { error: RATE_LIMIT_MESSAGE };

  const parsed = newFamilySchema.safeParse({
    familyName: formData.get("familyName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { familyName, name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Explicit nanoid rather than the schema's cuid() default: a cuid's
  // "random" portion is a handful of base36 characters padded out with a
  // guessable timestamp/counter/fingerprint, which falls well short of the
  // "long, unguessable secret" this token is documented to be (see
  // Family.icsToken and regenerateIcsToken, which already uses nanoid).
  const { nanoid } = await import("nanoid");

  const family = await prisma.family.create({
    data: {
      name: familyName,
      icsToken: nanoid(24),
      members: {
        create: {
          name,
          email,
          passwordHash,
          role: "OWNER",
        },
      },
    },
    include: { members: true },
  });

  await sendVerificationForUser(family.members[0].id);
  await doSignIn(email, password);
  return { success: true };
}

const joinFamilySchema = z.object({
  code: z.string().trim().min(1, "Invite code is required."),
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

/** Joins an existing Family via a valid, unused, unexpired invite code. */
export async function signupWithInvite(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getClientIp();
  const allowed = await checkIpRateLimit("signup", ip, { max: 100, windowMs: 60 * 60 * 1000 });
  if (!allowed) return { error: RATE_LIMIT_MESSAGE };

  const parsed = joinFamilySchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { code, name, email, password } = parsed.data;

  const invite = await prisma.invite.findUnique({ where: { code } });
  if (!invite) return { error: "That invite code doesn't exist." };
  if (invite.usedAt) return { error: "That invite has already been used." };
  if (invite.expiresAt < new Date()) return { error: "That invite has expired." };
  if (invite.email && invite.email.toLowerCase() !== email) {
    return { error: "This invite was issued for a different email address." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // The usedAt check above isn't enough on its own to guarantee single use:
  // two requests racing the same code could both read usedAt as null before
  // either commits. Claim the invite with a conditional update instead --
  // an UPDATE ... WHERE usedAt IS NULL only ever succeeds for one concurrent
  // caller, so the loser sees claimed.count === 0 and backs out instead of
  // also creating a user.
  let newUserId: string;
  try {
    newUserId = await prisma.$transaction(async (tx) => {
      const claimed = await tx.invite.updateMany({
        where: { id: invite.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw new Error("INVITE_ALREADY_CLAIMED");
      }

      const user = await tx.user.create({
        data: {
          familyId: invite.familyId,
          name,
          email,
          passwordHash,
          role: invite.role,
        },
      });
      return user.id;
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INVITE_ALREADY_CLAIMED") {
      return { error: "That invite has already been used." };
    }
    throw err;
  }

  await sendVerificationForUser(newUserId);
  await doSignIn(email, password);
  return { success: true };
}

async function doSignIn(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      throw new Error("Account created, but automatic sign-in failed. Please log in.");
    }
    throw err;
  }
}

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export async function login(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Two limits: one per IP (stops credential stuffing across many
  // accounts from one source; skipped when the IP is unknown rather than
  // lumping every unproxied visitor into one bucket) and one per account
  // (stops brute-forcing a single password even if the attacker spreads
  // guesses across many IPs).
  const ip = await getClientIp();
  const [ipAllowed, accountAllowed] = await Promise.all([
    checkIpRateLimit("login", ip, { max: 30, windowMs: 15 * 60 * 1000 }),
    checkRateLimit(`login:account:${parsed.data.email}`, { max: 8, windowMs: 15 * 60 * 1000 }),
  ]);
  if (!ipAllowed || !accountAllowed) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Incorrect email or password." };
    }
    throw err;
  }

  return { success: true };
}
