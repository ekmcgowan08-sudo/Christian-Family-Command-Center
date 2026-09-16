"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/require-owner";
import { checkRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/actions/auth";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
  });

export async function changePassword(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { error: "Not signed in." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Someone with a hijacked or shared session but not the real password
  // could otherwise brute-force "current password" indefinitely to take
  // over the account outright -- same class of attack as login, so the
  // same defense, keyed by account since the caller is already
  // authenticated.
  const allowed = await checkRateLimit(`change-password:${session.user.id}`, {
    max: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!allowed) return { error: RATE_LIMIT_MESSAGE };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}

export async function regenerateIcsToken() {
  const session = await requireOwner();

  const { nanoid } = await import("nanoid");
  await prisma.family.update({
    where: { id: session.user.familyId },
    data: { icsToken: nanoid(24) },
  });
  revalidatePath("/dashboard/settings");
}
