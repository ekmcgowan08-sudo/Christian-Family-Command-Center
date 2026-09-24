import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, prisma } from "./helpers";
import { BASE_URL } from "./env";

test.describe("calendar event timezone handling", () => {
  test("an event entered in a non-UTC timezone is stored and fed back out as the correct UTC instant", async ({
    browser,
    request,
  }) => {
    // This suite's server runs in UTC (the sandbox's own timezone, and
    // the common default for cloud Node hosts) -- simulating a family
    // actually in Eastern time via a dedicated browser context is the
    // real-world scenario the datetime-local timezone bug only shows up
    // in. A server that happened to already share the family's timezone
    // would mask it completely: the naive-string bug this test guards
    // against silently parses a "2:30 PM" the browser sent using
    // whichever timezone the server happens to be in, not the family's.
    const context = await browser.newContext({ timezoneId: "America/New_York" });
    const page = await context.newPage();

    const email = uniqueEmail("calendar-tz");
    await signupNewFamily(page, {
      familyName: "The Timezones",
      name: "Tim Ezone",
      email,
      password: "supersecret123",
    });
    await page.goto("/dashboard/calendar");

    const title = `Timezone check ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    // 2:30-3:30 PM Eastern Daylight Time on this date -- 18:30-19:30 UTC.
    await page.fill('[data-testid="startAt"]', "2030-06-01T14:30");
    await page.fill('[data-testid="endAt"]', "2030-06-01T15:30");
    await page.click('button:has-text("Add to family calendar")');
    await expect(page.getByText(title)).toBeVisible();

    const event = await prisma.calendarEvent.findFirstOrThrow({ where: { title } });
    expect(event.startAt.toISOString()).toBe("2030-06-01T18:30:00.000Z");
    expect(event.endAt.toISOString()).toBe("2030-06-01T19:30:00.000Z");

    // The .ics feed -- what a phone actually subscribes to -- must carry
    // the same correct UTC instant. This is the concretely broken part
    // of the original bug: a phone set to the family's own timezone
    // would have shown the wrong local time for every synced event.
    const family = await prisma.family.findFirstOrThrow({ where: { name: "The Timezones" } });
    const res = await request.get(`${BASE_URL}/api/feed/${family.icsToken}.ics`);
    const ics = await res.text();
    expect(ics).toMatch(new RegExp(`SUMMARY:${title}[\\s\\S]*?DTSTART:20300601T183000Z`));
    expect(ics).toMatch(new RegExp(`SUMMARY:${title}[\\s\\S]*?DTEND:20300601T193000Z`));

    await context.close();
  });
});

test.describe("calendar event CRUD", () => {
  test.beforeEach(async ({ page }) => {
    const email = uniqueEmail("calendar");
    await signupNewFamily(page, {
      familyName: "The Calendars",
      name: "Cal Endar",
      email,
      password: "supersecret123",
    });
    await page.goto("/dashboard/calendar");
  });

  test("adding an event shows it in the upcoming list and persists to the database", async ({
    page,
  }) => {
    const title = `Soccer practice ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.fill('[data-testid="startAt"]', "2030-06-01T09:00");
    await page.fill('[data-testid="endAt"]', "2030-06-01T10:00");
    await page.fill('input[name="location"]', "The park");
    await page.click('button:has-text("Add to family calendar")');

    await expect(page.getByText(title)).toBeVisible();

    const event = await prisma.calendarEvent.findFirst({ where: { title } });
    expect(event).not.toBeNull();
    expect(event?.location).toBe("The park");
    expect(event?.source).toBe("MANUAL");
  });

  test("editing an event updates it in place without touching other events", async ({
    page,
  }) => {
    const originalTitle = `Original title ${Date.now()}`;
    const otherTitle = `Untouched event ${Date.now()}`;

    for (const title of [originalTitle, otherTitle]) {
      await page.fill('input[name="title"]', title);
      await page.fill('[data-testid="startAt"]', "2030-06-01T09:00");
      await page.fill('[data-testid="endAt"]', "2030-06-01T10:00");
      await page.click('button:has-text("Add to family calendar")');
      await expect(page.getByText(title)).toBeVisible();
    }

    const newTitle = `Updated title ${Date.now()}`;
    const item = page.locator("li", { hasText: originalTitle });
    await item.getByRole("button", { name: "Edit" }).click();
    const editForm = page.locator("li form").filter({ has: page.locator('input[name="eventId"]') });
    await editForm.locator('input[name="title"]').fill(newTitle);
    await editForm.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText(newTitle)).toBeVisible();
    await expect(page.getByText(originalTitle)).not.toBeVisible();
    await expect(page.getByText(otherTitle)).toBeVisible();

    const updated = await prisma.calendarEvent.findFirst({ where: { title: newTitle } });
    expect(updated).not.toBeNull();
    const untouched = await prisma.calendarEvent.findFirst({ where: { title: otherTitle } });
    expect(untouched).not.toBeNull();
  });

  test("removing an event deletes it from the database", async ({ page }) => {
    const title = `Delete me ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.fill('[data-testid="startAt"]', "2030-06-01T09:00");
    await page.fill('[data-testid="endAt"]', "2030-06-01T10:00");
    await page.click('button:has-text("Add to family calendar")');
    await expect(page.getByText(title)).toBeVisible();

    const item = page.locator("li", { hasText: title });
    await item.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText(title)).not.toBeVisible();

    const deleted = await prisma.calendarEvent.findFirst({ where: { title } });
    expect(deleted).toBeNull();
  });
});
