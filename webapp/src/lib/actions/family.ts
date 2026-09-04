"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/auth";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
  role: z.enum(["OWNER", "MEMBER"]),
});

export type InviteResult = ActionResult | { success: true; code: string };

export async function createInvite(
  _prevState: InviteResult | null,
  formData: FormData
): Promise<InviteResult> {
  const session = await auth();
  if (!session) return { error: "Not signed in." };
  if (session.user.role !== "OWNER") {
    return { error: "Only a family owner can invite new members." };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const invite = await prisma.invite.create({
    data: {
      familyId: session.user.familyId,
      invitedByUserId: session.user.id,
      email: parsed.data.email || null,
      role: parsed.data.role,
      expiresAt,
    },
  });

  revalidatePath("/dashboard/family");
  return { success: true, code: invite.code };
}

export async function revokeInvite(inviteId: string) {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") throw new Error("Not authorized.");

  await prisma.invite.deleteMany({
    where: { id: inviteId, familyId: session.user.familyId, usedAt: null },
  });
  revalidatePath("/dashboard/family");
}

export async function removeMember(memberId: string) {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") throw new Error("Not authorized.");
  if (memberId === session.user.id) throw new Error("You can't remove yourself.");

  await prisma.user.deleteMany({
    where: { id: memberId, familyId: session.user.familyId },
  });
  revalidatePath("/dashboard/family");
}
