"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isEmailConfigured, sendInviteEmail } from "@/lib/email";
import { requireOwner } from "@/lib/require-owner";
import type { ActionResult } from "@/lib/actions/auth";

/**
 * Locks every OWNER row in a family for the rest of the current
 * transaction (SELECT ... FOR UPDATE), so a concurrent call doing the
 * same "is there still another owner?" check can't also read the
 * pre-change count -- it blocks until this transaction commits, then
 * re-reads the now-current state. Without this, two owners leaving (or
 * demoting each other) at the same instant could each see the other as
 * "the other owner" and both proceed, leaving the family with none.
 */
async function lockFamilyOwnerIds(
  tx: Prisma.TransactionClient,
  familyId: string
): Promise<string[]> {
  const owners = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM "User" WHERE "familyId" = ${familyId} AND role = 'OWNER' FOR UPDATE
  `;
  return owners.map((o) => o.id);
}

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
 * Promotes or demotes another member. The caller must already be an
 * owner and can't target their own row, but that alone doesn't rule out
 * two owners demoting each other in the same instant -- each would see
 * the other as still-an-owner and both demotions would go through,
 * leaving zero. Demoting the family's last other owner is blocked by
 * lockFamilyOwnerIds re-checking under a row lock, not by this
 * function's own state.
 */
export async function changeMemberRole(memberId: string, newRole: "OWNER" | "MEMBER") {
  const session = await requireOwner();
  if (memberId === session.user.id) throw new Error("You can't change your own role.");

  await prisma.$transaction(async (tx) => {
    const owners = await lockFamilyOwnerIds(tx, session.user.familyId);

    const target = await tx.user.findUnique({
      where: { id: memberId },
      select: { familyId: true, role: true },
    });
    if (!target || target.familyId !== session.user.familyId) return;

    if (target.role === "OWNER" && newRole === "MEMBER" && owners.filter((id) => id !== memberId).length === 0) {
      throw new Error("Can't demote the family's only owner -- promote someone else first.");
    }

    await tx.user.update({ where: { id: memberId }, data: { role: newRole } });
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
 * Lets a member remove themselves from the family and sign out. An
 * owner can only leave this way if at least one other owner is in
 * place -- otherwise the family would be left with no one able to
 * manage it, and the only way out is deleteFamily instead.
 *
 * Checks the member's role and the family's other owners fresh from the
 * database, not the (possibly stale) JWT session -- someone freshly
 * promoted to owner, or whose only co-owner just left, should be
 * stopped here even if their session hasn't caught up yet. The
 * "other owners" count is read under lockFamilyOwnerIds's row lock, not
 * a plain count: two owners leaving in the same instant could otherwise
 * each see the other as "the other owner" and both succeed, leaving
 * zero -- the exact race this function's own comment used to claim was
 * already handled, before it actually was.
 */
export async function leaveFamily() {
  const session = await auth();
  if (!session) throw new Error("Not signed in.");

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: session.user.id } });
    if (!user) throw new Error("User not found.");

    if (user.role === "OWNER") {
      const owners = await lockFamilyOwnerIds(tx, user.familyId);
      const otherOwners = owners.filter((id) => id !== user.id).length;
      if (otherOwners === 0) {
        throw new Error(
          "You're the only owner, so you can't leave this way -- promote another member to owner first, or delete the family instead."
        );
      }
    }

    // CalendarEvent.sourceUserId isn't a foreign key Prisma can cascade
    // on, so this member's synced Google events need cleaning up
    // explicitly -- same as disconnecting Google or turning off
    // calendar sharing.
    await tx.calendarEvent.deleteMany({
      where: { source: "GOOGLE", sourceUserId: user.id },
    });
    await tx.user.delete({ where: { id: user.id } });
  });

  await signOut({ redirectTo: "/" });
}

/**
 * Permanently deletes the whole family -- every member, every calendar
 * event, every pending invite. Requires typing the family's exact name
 * to confirm, the same friction real apps use before a destructive,
 * unrecoverable action that affects more than just the person clicking
 * the button.
 *
 * Family cascades to User on delete, so two owners confirming deletion
 * at close to the same instant race each other in a way that's easy to
 * miss: the loser's own row can vanish out from under it mid-request
 * (requireOwner would then just deny them, a graceful outcome already
 * handled below) or, later, its own `family.delete` call can hit a row
 * the winner already removed. Both P2025 ("record to delete does not
 * exist") cases below mean the same thing -- someone else already
 * finished deleting this family -- so they're treated as success
 * rather than left to crash out to Next's generic error page.
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

  let family;
  try {
    family = await prisma.family.findUniqueOrThrow({
      where: { id: session.user.familyId },
    });
  } catch (err) {
    if (isRecordNotFoundError(err)) {
      await signOut({ redirectTo: "/" });
      return { success: true };
    }
    throw err;
  }

  const confirmName = formData.get("confirmName");
  if (typeof confirmName !== "string" || confirmName !== family.name) {
    return { error: `Type "${family.name}" exactly to confirm.` };
  }

  // Family -> User/CalendarEvent/Invite, and User -> GoogleAccount/tokens,
  // all cascade in the schema -- one delete cleans up everything.
  try {
    await prisma.family.delete({ where: { id: family.id } });
  } catch (err) {
    if (!isRecordNotFoundError(err)) throw err;
  }

  await signOut({ redirectTo: "/" });
  return { success: true };
}

function isRecordNotFoundError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}
