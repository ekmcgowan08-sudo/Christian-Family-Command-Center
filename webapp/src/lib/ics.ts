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

// iCalendar's DTEND is exclusive: for an all-day event, DTEND must be the
// day *after* the last day it occupies, or a multi-day all-day event
// silently loses its last day when a real calendar app imports the feed.
// A one-day event (start === end here) still comes out correct: DTEND
// becomes start+1, which `ics` treats the same as its own single-day
// shorthand of omitting DTEND entirely.
function addUtcDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
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
    end: toDateArray(e.allDay ? addUtcDays(e.endAt, 1) : e.endAt, e.allDay),
    endInputType: "utc",
    calName: `${family.name} Family Calendar`,
  }));

  const { error, value } = createEvents(icsEvents);
  if (error) throw error;
  return value ?? "";
}
