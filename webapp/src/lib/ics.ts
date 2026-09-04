import { createEvents, type EventAttributes, type DateArray } from "ics";
import { prisma } from "@/lib/prisma";

function toDateArray(d: Date, allDay: boolean): DateArray {
  if (allDay) {
    return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
  }
  return [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  ];
}

/** Builds an .ics feed of every event on a family's shared calendar. */
export async function buildFamilyIcsFeed(icsToken: string): Promise<string | null> {
  const family = await prisma.family.findUnique({ where: { icsToken } });
  if (!family) return null;

  const events = await prisma.calendarEvent.findMany({
    where: { familyId: family.id },
    orderBy: { startAt: "asc" },
  });

  const icsEvents: EventAttributes[] = events.map((e) => ({
    uid: `${e.id}@christian-family-command-center`,
    title: e.title,
    description: e.description ?? undefined,
    location: e.location ?? undefined,
    start: toDateArray(e.startAt, e.allDay),
    startInputType: "utc",
    end: toDateArray(e.endAt, e.allDay),
    endInputType: "utc",
    calName: `${family.name} Family Calendar`,
  }));

  const { error, value } = createEvents(icsEvents);
  if (error) throw error;
  return value ?? "";
}
