"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncGoogleCalendarForUser } from "@/lib/google/calendar";

async function requireUserId() {
  const session = await auth();
  if (!session) throw new Error("Not signed in.");
  return session.user.id;
}

export async function setShareCalendar(share: boolean) {
  const userId = await requireUserId();
  await prisma.googleAccount.update({
    where: { userId },
    data: { shareCalendar: share },
  });

  if (share) {
    await syncGoogleCalendarForUser(userId);
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
  await syncGoogleCalendarForUser(userId);
  revalidatePath("/dashboard/integrations");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
}
