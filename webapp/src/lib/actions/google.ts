"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncGoogleCalendarForUser } from "@/lib/google/calendar";

async function requireUserId() {
  const session = await auth();
  if (!session) throw new Error("Not signed in.");
  return session.user.id;
}

/**
 * Runs a Google Calendar sync and, on failure (most commonly a revoked or
 * expired token -- Google access can lapse at any time, outside this
 * app's control), redirects back to Settings with a message the user can
 * act on instead of crashing the whole dashboard into Next's generic
 * error page.
 */
async function syncOrRedirectToError(userId: string) {
  try {
    await syncGoogleCalendarForUser(userId);
  } catch (err) {
    console.error("Google Calendar sync failed", err);
    redirect("/dashboard/integrations?error=google_sync_failed");
  }
}

export async function setShareCalendar(share: boolean) {
  const userId = await requireUserId();
  await prisma.googleAccount.update({
    where: { userId },
    data: { shareCalendar: share },
  });

  if (share) {
    await syncOrRedirectToError(userId);
  } else {
    // Pull this member's previously-synced events back out of the family view.
    await prisma.calendarEvent.deleteMany({
      where: { source: "GOOGLE", sourceUserId: userId },
    });
  }

  revalidatePath("/dashboard/integrations");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
}

export async function disconnectGoogleAccount() {
  const userId = await requireUserId();
  await prisma.calendarEvent.deleteMany({
    where: { source: "GOOGLE", sourceUserId: userId },
  });
  await prisma.googleAccount.delete({ where: { userId } }).catch(() => {
    // already disconnected -- nothing to do
  });
  revalidatePath("/dashboard/integrations");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
}

export async function syncNow() {
  const userId = await requireUserId();
  await syncOrRedirectToError(userId);
  revalidatePath("/dashboard/integrations");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
}
