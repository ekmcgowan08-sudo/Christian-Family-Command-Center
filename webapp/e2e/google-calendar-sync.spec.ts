import { test, expect } from "@playwright/test";
import { uniqueEmail, prisma } from "./helpers";
import { mergeGoogleEventsIntoFamilyCalendar } from "../src/lib/google/calendar";

test.describe("Google Calendar sync merge/prune logic", () => {
  test("events deleted or moved out of the sync window at the source are removed, but past events are never touched", async () => {
    // Set up a family + member directly (no real Google OAuth available in
    // this environment) -- this test exercises the real
    // mergeGoogleEventsIntoFamilyCalendar function against the real test
    // database, passed in as `db` instead of the module's default client
    // so it can't accidentally touch the dev database.
    const family = await prisma.family.create({
      data: {
        name: "Google Sync Test Family",
        icsToken: `google-sync-test-${Date.now()}`,
        members: {
          create: {
            name: "Sync Owner",
            email: uniqueEmail("google-sync-owner"),
            passwordHash: "not-a-real-hash",
            role: "OWNER",
          },
        },
      },
      include: { members: true },
    });
    const userId = family.members[0].id;
    const timeMin = new Date();

    // Pre-existing state, as if a previous sync had already run: one
    // upcoming event that the source will keep (should be updated, not
    // duplicated), one upcoming event the source no longer has (should be
    // pruned), and one past event no longer in the source (must survive --
    // "Recently past" on the calendar page is a standing archive, not
    // something a sync should be able to wipe out).
    await prisma.calendarEvent.create({
      data: {
        familyId: family.id,
        title: "Stale title before update",
        startAt: new Date(Date.now() + 2 * 86400000),
        endAt: new Date(Date.now() + 2 * 86400000 + 3600000),
        source: "GOOGLE",
        sourceUserId: userId,
        sourceEventId: "kept-event",
      },
    });
    await prisma.calendarEvent.create({
      data: {
        familyId: family.id,
        title: "Deleted at the source",
        startAt: new Date(Date.now() + 5 * 86400000),
        endAt: new Date(Date.now() + 5 * 86400000 + 3600000),
        source: "GOOGLE",
        sourceUserId: userId,
        sourceEventId: "removed-event",
      },
    });
    await prisma.calendarEvent.create({
      data: {
        familyId: family.id,
        title: "Already happened",
        startAt: new Date(Date.now() - 5 * 86400000),
        endAt: new Date(Date.now() - 5 * 86400000 + 3600000),
        source: "GOOGLE",
        sourceUserId: userId,
        sourceEventId: "past-event",
      },
    });

    // A fresh sync: the source still has "kept-event" (retitled) and a
    // brand-new "new-event", but no longer has "removed-event" -- and of
    // course says nothing about the past event, since the sync window is
    // forward-looking only.
    const newEventStart = new Date(Date.now() + 3 * 86400000);
    const newEventEnd = new Date(Date.now() + 3 * 86400000 + 3600000);
    const result = await mergeGoogleEventsIntoFamilyCalendar(
      {
        familyId: family.id,
        userId,
        timeMin,
        items: [
          {
            id: "kept-event",
            status: "confirmed",
            summary: "Updated title",
            start: { dateTime: new Date(Date.now() + 2 * 86400000).toISOString() },
            end: { dateTime: new Date(Date.now() + 2 * 86400000 + 3600000).toISOString() },
          },
          {
            id: "new-event",
            status: "confirmed",
            summary: "Brand new event",
            start: { dateTime: newEventStart.toISOString() },
            end: { dateTime: newEventEnd.toISOString() },
          },
        ],
      },
      prisma
    );

    expect(result.synced).toBe(2);

    const remaining = await prisma.calendarEvent.findMany({
      where: { familyId: family.id, source: "GOOGLE" },
      orderBy: { sourceEventId: "asc" },
    });
    const bySourceId = Object.fromEntries(remaining.map((e) => [e.sourceEventId, e]));

    // Removed from the source -> pruned.
    expect(bySourceId["removed-event"]).toBeUndefined();
    // Still at the source -> updated in place, not duplicated.
    expect(bySourceId["kept-event"]?.title).toBe("Updated title");
    // New at the source -> created.
    expect(bySourceId["new-event"]?.title).toBe("Brand new event");
    // Past, and absent from this sync's items -> untouched, not pruned.
    expect(bySourceId["past-event"]?.title).toBe("Already happened");
    expect(remaining).toHaveLength(3);

    await prisma.family.delete({ where: { id: family.id } });
  });

  test("a cancelled item at the source is pruned even though the loop itself skips it", async () => {
    const family = await prisma.family.create({
      data: {
        name: "Google Sync Cancel Test Family",
        icsToken: `google-sync-cancel-test-${Date.now()}`,
        members: {
          create: {
            name: "Cancel Owner",
            email: uniqueEmail("google-sync-cancel-owner"),
            passwordHash: "not-a-real-hash",
            role: "OWNER",
          },
        },
      },
      include: { members: true },
    });
    const userId = family.members[0].id;
    const timeMin = new Date();

    await prisma.calendarEvent.create({
      data: {
        familyId: family.id,
        title: "Will be cancelled",
        startAt: new Date(Date.now() + 86400000),
        endAt: new Date(Date.now() + 86400000 + 3600000),
        source: "GOOGLE",
        sourceUserId: userId,
        sourceEventId: "cancelled-event",
      },
    });

    // Some Google sync modes (incremental/sync-token based) report a
    // deletion as an item with status "cancelled" rather than just
    // omitting it -- the merge loop explicitly skips those (they're not
    // upsert-able, there's nothing to show), so the prune step is what
    // actually has to remove the row; confirm it does.
    const result = await mergeGoogleEventsIntoFamilyCalendar(
      {
        familyId: family.id,
        userId,
        timeMin,
        items: [{ id: "cancelled-event", status: "cancelled" }],
      },
      prisma
    );

    expect(result.synced).toBe(0);
    const stillThere = await prisma.calendarEvent.findFirst({
      where: { familyId: family.id, sourceEventId: "cancelled-event" },
    });
    expect(stillThere).toBeNull();

    await prisma.family.delete({ where: { id: family.id } });
  });
});
