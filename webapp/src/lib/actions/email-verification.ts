"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isEmailConfigured, sendVerificationEmail } from "@/lib/email";
import type { ActionResult } from "@/lib/actions/auth";

/**
 * Creates a verification token and emails it, if email is configured.
 * Called right after signup and from the resend button in Settings.
 * Silently does nothing if email isn't set up -- there's no verification
 * flow to speak of without it, so this is a no-op rather than an error.
 */
export async function sendVerificationForUser(userId: string) {
  if (!isEmailConfigured()) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.emailVerifiedAt) return;

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const verificationToken = await prisma.emailVerificationToken.create({
    data: { userId: user.id, expiresAt },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken.token}`;
  try {
    await sendVerificationEmail({ to: user.email, name: user.name, verifyUrl });
  } catch (err) {
    // Signup and login should never fail just because this reminder email
    // didn't go out -- log it and move on.
    console.error("Failed to send verification email", err);
  }
}

export async function verifyEmail(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const token = formData.get("token");
  if (typeof token !== "string" || !token) {
    return { error: "Missing verification token." };
  }

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });
  if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt < new Date()) {
    return { error: "That verification link is invalid or has expired. Request a new one from Settings." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}

export type ResendResult = { error: string } | { success: true; message: string };

export async function resendVerificationEmail(): Promise<ResendResult> {
  const session = await auth();
  if (!session) return { error: "Not signed in." };

  if (!isEmailConfigured()) {
    return { error: "Email isn't configured for this app yet." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };
  if (user.emailVerifiedAt) {
    return { success: true, message: "Your email is already verified." };
  }

  await sendVerificationForUser(user.id);
  return { success: true, message: "Verification email sent -- check your inbox." };
}
