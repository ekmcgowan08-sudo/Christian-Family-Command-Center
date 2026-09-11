"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isEmailConfigured, sendInviteEmail } from "@/lib/email";
import { requireOwner } from "@/lib/require-owner";
import type { ActionResult } from "@/lib/actions/auth";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
  role: z.enum(["OWNER", "MEMBER"]),
});

export type InviteResult = ActionResult | { success: true; code: string; emailed: boolean };

export async function createInvite(
  _prevState: InviteResult | null,
  formData: FormData
): Promise<InviteResult> {
  let session;
  try {
    session = await requireOwner("Only a family owner can invite new members.");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Not authorized." };
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
    include: { family: true },
  });

  let emailed = false;
  if (invite.email && isEmailConfigured()) {
    const inviteUrl = `${process.env.NEXTAUTH_URL}/signup?code=${invite.code}`;
    try {
      await sendInviteEmail({
        to: invite.email,
        inviterName: session.user.name ?? "A family member",
        familyName: invite.family.name,
        inviteUrl,
      });
      emailed = true;
    } catch (err) {
      // Fall back to the copy-paste link shown in the UI -- don't fail
      // invite creation just because the email send failed.
      console.error("Failed to send invite email", err);
    }
  }

  revalidatePath("/dashboard/family");
  return { success: true, code: invite.code, emailed };
}

export async function revokeInvite(inviteId: string) {
  const session = await requireOwner();

  await prisma.invite.deleteMany({
    where: { id: inviteId, familyId: session.user.familyId, usedAt: null },
  });
  revalidatePath("/dashboard/family");
}

/**
 * Promotes or demotes another member. Always leaves at least one owner
 * behind: the caller must already be an owner, and can't target their
 * own row, so the acting owner is never the one being demoted.
 */
export async function changeMemberRole(memberId: string, newRole: "OWNER" | "MEMBER") {
  const session = await requireOwner();
  if (memberId === session.user.id) throw new Error("You can't change your own role.");

  await prisma.user.updateMany({
    where: { id: memberId, familyId: session.user.familyId },
    data: { role: newRole },
  });
  revalidatePath("/dashboard/family");
}

export async function removeMember(memberId: string) {
  const session = await requireOwner();
  if (memberId === session.user.id) throw new Error("You can't remove yourself.");

  await prisma.user.deleteMany({
    where: { id: memberId, familyId: session.user.familyId },
  });
  revalidatePath("/dashboard/family");
}

/**
 * Lets a non-owner member remove themselves from the family and sign
 * out. Owners can't leave this way -- there's no "transfer ownership"
 * feature yet, so an owner leaving would orphan the family. An owner who
 * wants out entirely should use deleteFamily instead.
 *
 * Checks the member's role fresh from the database, not the (possibly
 * stale) JWT session -- someone freshly promoted to owner should be
 * stopped here even if their session hasn't caught up yet.
 */
export async function leaveFamily() {
  const session = await auth();
  if (!session) throw new Error("Not signed in.");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("User not found.");
  if (user.role === "OWNER") {
    throw new Error(
      "As the family owner, you can't leave this way -- delete the family instead, or have another owner remove you."
    );
  }

  // CalendarEvent.sourceUserId isn't a foreign key Prisma can cascade on,
  // so this member's synced Google events need cleaning up explicitly --
  // same as disconnecting Google or turning off calendar sharing.
  await prisma.calendarEvent.deleteMany({
    where: { source: "GOOGLE", sourceUserId: user.id },
  });
  await prisma.user.delete({ where: { id: user.id } });

  await signOut({ redirectTo: "/" });
}

/**
 * Permanently deletes the whole family -- every member, every calendar
 * event, every pending invite. Requires typing the family's exact name
 * to confirm, the same friction real apps use before a destructive,
 * unrecoverable action that affects more than just the person clicking
 * the button.
 */
export async function deleteFamily(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  let session;
  try {
    session = await requireOwner("Only a family owner can delete the family.");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Not authorized." };
  }

  const family = await prisma.family.findUniqueOrThrow({
    where: { id: session.user.familyId },
  });

  const confirmName = formData.get("confirmName");
  if (typeof confirmName !== "string" || confirmName !== family.name) {
    return { error: `Type "${family.name}" exactly to confirm.` };
  }

  // Family -> User/CalendarEvent/Invite, and User -> GoogleAccount/tokens,
  // all cascade in the schema -- one delete cleans up everything.
  await prisma.family.delete({ where: { id: family.id } });

  await signOut({ redirectTo: "/" });
  return { success: true };
}
