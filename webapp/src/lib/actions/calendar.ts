"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/auth";

const eventSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(200),
    description: z.string().trim().max(2000).nullish(),
    location: z.string().trim().max(200).nullish(),
    startAt: z.string().min(1, "Start date/time is required."),
    endAt: z.string().min(1, "End date/time is required."),
    allDay: z.string().nullish(),
  })
  .refine((data) => new Date(data.endAt) >= new Date(data.startAt), {
    message: "End time must be after the start time.",
    path: ["endAt"],
  });

export async function createEvent(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { error: "Not signed in." };

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    allDay: formData.get("allDay"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event." };
  }

  const { title, description, location, startAt, endAt, allDay } = parsed.data;

  await prisma.calendarEvent.create({
    data: {
      familyId: session.user.familyId,
      title,
      description: description || null,
      location: location || null,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      allDay: allDay === "on",
      source: "MANUAL",
      createdByUserId: session.user.id,
    },
  });

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const session = await auth();
  if (!session) throw new Error("Not signed in.");

  // Any family member can remove a manually-added event; synced Google
  // events can only be removed by disconnecting/un-sharing that calendar,
  // so they're not deletable here.
  await prisma.calendarEvent.deleteMany({
    where: { id: eventId, familyId: session.user.familyId, source: "MANUAL" },
  });

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard");
}
