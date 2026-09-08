import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, prisma } from "./helpers";

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
    await page.fill('input[name="startAt"]', "2030-06-01T09:00");
    await page.fill('input[name="endAt"]', "2030-06-01T10:00");
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
      await page.fill('input[name="startAt"]', "2030-06-01T09:00");
      await page.fill('input[name="endAt"]', "2030-06-01T10:00");
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
    await page.fill('input[name="startAt"]', "2030-06-01T09:00");
    await page.fill('input[name="endAt"]', "2030-06-01T10:00");
    await page.click('button:has-text("Add to family calendar")');
    await expect(page.getByText(title)).toBeVisible();

    const item = page.locator("li", { hasText: title });
    await item.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText(title)).not.toBeVisible();

    const deleted = await prisma.calendarEvent.findFirst({ where: { title } });
    expect(deleted).toBeNull();
  });
});
