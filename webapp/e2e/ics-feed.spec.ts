import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, prisma } from "./helpers";
import { BASE_URL } from "./env";

test.describe("the .ics calendar feed", () => {
  test("all-day events get an RFC 5545-correct exclusive DTEND", async ({ page, request }) => {
    const email = uniqueEmail("ics-feed");
    await signupNewFamily(page, {
      familyName: "The Feeders",
      name: "Fee Der",
      email,
      password: "supersecret123",
    });

    const family = await prisma.family.findFirstOrThrow({ where: { name: "The Feeders" } });

    // A single-day all-day event (start date === end date, as the add-event
    // form naturally produces when someone picks the same day twice).
    await prisma.calendarEvent.create({
      data: {
        familyId: family.id,
        title: "Single day holiday",
        startAt: new Date("2030-07-04T09:00:00Z"),
        endAt: new Date("2030-07-04T17:00:00Z"),
        allDay: true,
        source: "MANUAL",
      },
    });

    // A multi-day all-day event -- a 3-day trip, July 10 through July 12
    // inclusive, the way a person would naturally pick it.
    await prisma.calendarEvent.create({
      data: {
        familyId: family.id,
        title: "Family trip",
        startAt: new Date("2030-07-10T00:00:00Z"),
        endAt: new Date("2030-07-12T00:00:00Z"),
        allDay: true,
        source: "MANUAL",
      },
    });

    // An ordinary timed event, which the fix must leave untouched.
    await prisma.calendarEvent.create({
      data: {
        familyId: family.id,
        title: "Soccer practice",
        startAt: new Date("2030-07-15T18:00:00Z"),
        endAt: new Date("2030-07-15T19:30:00Z"),
        allDay: false,
        source: "MANUAL",
      },
    });

    const res = await request.get(`${BASE_URL}/api/feed/${family.icsToken}.ics`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/calendar");
    const ics = await res.text();

    // Single-day: DTSTART on the day itself, DTEND the day after (RFC
    // 5545's exclusive end for a VALUE=DATE range) -- confirms this
    // isn't silently truncated to a zero-length event.
    expect(ics).toMatch(/SUMMARY:Single day holiday[\s\S]*?DTSTART;VALUE=DATE:20300704/);
    expect(ics).toMatch(/SUMMARY:Single day holiday[\s\S]*?DTEND;VALUE=DATE:20300705/);

    // Multi-day: DTEND must be July 13, one day past the last real day
    // (July 12) -- the actual bug this fix addresses. Before the fix
    // this would have come out as 20300712, silently dropping the last day.
    expect(ics).toMatch(/SUMMARY:Family trip[\s\S]*?DTSTART;VALUE=DATE:20300710/);
    expect(ics).toMatch(/SUMMARY:Family trip[\s\S]*?DTEND;VALUE=DATE:20300713/);

    // Timed event: full date-time, no VALUE=DATE, and not shifted by a day.
    expect(ics).toMatch(/SUMMARY:Soccer practice[\s\S]*?DTSTART:20300715T180000Z/);
    expect(ics).toMatch(/SUMMARY:Soccer practice[\s\S]*?DTEND:20300715T193000Z/);
  });

  test("an unknown token 404s, and a family with no events still gets a valid empty feed", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("ics-empty");
    await signupNewFamily(page, {
      familyName: "The Emptycals",
      name: "Emp Tycal",
      email,
      password: "supersecret123",
    });
    const family = await prisma.family.findFirstOrThrow({ where: { name: "The Emptycals" } });

    const emptyRes = await request.get(`${BASE_URL}/api/feed/${family.icsToken}.ics`);
    expect(emptyRes.status()).toBe(200);
    const emptyIcs = await emptyRes.text();
    expect(emptyIcs).toContain("BEGIN:VCALENDAR");
    expect(emptyIcs).toContain("END:VCALENDAR");
    expect(emptyIcs).not.toContain("BEGIN:VEVENT");

    const badRes = await request.get(`${BASE_URL}/api/feed/not-a-real-token.ics`);
    expect(badRes.status()).toBe(404);
  });
});
