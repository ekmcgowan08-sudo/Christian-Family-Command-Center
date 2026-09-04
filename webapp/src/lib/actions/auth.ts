"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

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

  await prisma.family.create({
    data: {
      name: familyName,
      members: {
        create: {
          name,
          email,
          passwordHash,
          role: "OWNER",
        },
      },
    },
  });

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

  await prisma.$transaction([
    prisma.user.create({
      data: {
        familyId: invite.familyId,
        name,
        email,
        passwordHash,
        role: invite.role,
      },
    }),
    prisma.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    }),
  ]);

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
