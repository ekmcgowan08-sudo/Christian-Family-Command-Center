"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";
import type { ActionResult } from "@/lib/actions/auth";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export type RequestResetResult = { error: string } | { success: true; message: string };

/**
 * Always returns the same generic success message, whether or not the
 * email matches an account -- otherwise this endpoint could be used to
 * probe which emails have accounts.
 */
export async function requestPasswordReset(
  _prevState: RequestResetResult | null,
  formData: FormData
): Promise<RequestResetResult> {
  const parsed = requestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (!isEmailConfigured()) {
    return {
      error:
        "Password reset emails aren't set up for this app yet. Ask your family owner to remove and re-invite you, or have an administrator configure email (see docs/EMAIL_SETUP.md).",
    };
  }

  const genericMessage =
    "If that email has an account, we've sent a link to reset the password.";

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return { success: true, message: genericMessage };
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const resetToken = await prisma.passwordResetToken.create({
    data: { userId: user.id, expiresAt },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken.token}`;
  try {
    await sendPasswordResetEmail({ to: user.email, resetUrl });
  } catch (err) {
    console.error("Failed to send password reset email", err);
    return { error: "Something went wrong sending the email. Please try again." };
  }

  return { success: true, message: genericMessage };
}

const resetSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export async function resetPassword(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "That reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate any other outstanding reset tokens for this user.
    prisma.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}
