import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, prisma } from "./helpers";

test.describe("leaving and deleting a family", () => {
  test("a member can leave, their login is removed, and the rest of the family is untouched", async ({
    page,
    browser,
  }) => {
    const ownerEmail = uniqueEmail("owner-leave");
    await signupNewFamily(page, {
      familyName: "The Leavers",
      name: "Owen Owner",
      email: ownerEmail,
      password: "supersecret123",
    });

    await page.goto("/dashboard/family");
    await page.click('button:has-text("Create invite link")');
    await expect(page.getByText(/share this link/i)).toBeVisible();
    const family = await prisma.family.findFirstOrThrow({ where: { name: "The Leavers" } });
    const invite = await prisma.invite.findFirstOrThrow({
      where: { familyId: family.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    const memberEmail = uniqueEmail("member-leave");
    await memberPage.goto(`/signup?code=${invite.code}`);
    await memberPage.fill('input[name="name"]', "Lea Ver");
    await memberPage.fill('input[name="email"]', memberEmail);
    await memberPage.fill('input[name="password"]', "anotherpassword");
    await memberPage.click('button[type="submit"]');
    await memberPage.waitForURL("**/dashboard");

    // Add a manual event as the member -- it should survive them leaving.
    await memberPage.goto("/dashboard/calendar");
    const eventTitle = `Survives leaving ${Date.now()}`;
    await memberPage.fill('input[name="title"]', eventTitle);
    await memberPage.fill('input[name="startAt"]', "2030-06-01T09:00");
    await memberPage.fill('input[name="endAt"]', "2030-06-01T10:00");
    await memberPage.click('button:has-text("Add to family calendar")');
    await expect(memberPage.getByText(eventTitle)).toBeVisible();

    // Leave.
    await memberPage.goto("/dashboard/settings");
    await expect(memberPage.getByText("Danger zone")).toBeVisible();
    memberPage.once("dialog", (dialog) => dialog.accept());
    await memberPage.click('button:has-text("Leave family")');
    await memberPage.waitForURL((url) => url.pathname === "/");

    const deletedUser = await prisma.user.findUnique({ where: { email: memberEmail } });
    expect(deletedUser).toBeNull();

    // Visiting the dashboard afterward should bounce to login, not error.
    await memberPage.goto("/dashboard");
    await expect(memberPage).toHaveURL(/\/login/);
    await memberContext.close();

    // Owner still sees the family intact, and the event the member added
    // is still there (now unattributed rather than deleted).
    await page.goto("/dashboard/family");
    await expect(page.getByText("Lea Ver")).not.toBeVisible();
    await page.goto("/dashboard/calendar");
    await expect(page.getByText(eventTitle)).toBeVisible();

    const survivedEvent = await prisma.calendarEvent.findFirst({ where: { title: eventTitle } });
    expect(survivedEvent).not.toBeNull();
    expect(survivedEvent?.createdByUserId).toBeNull();
  });

  test("an owner cannot leave, but can delete the whole family with confirmation", async ({
    page,
  }) => {
    const ownerEmail = uniqueEmail("owner-delete");
    await signupNewFamily(page, {
      familyName: "The Deleters",
      name: "Del Eter",
      email: ownerEmail,
      password: "supersecret123",
    });

    await page.goto("/dashboard/settings");
    await expect(page.getByText("Danger zone")).toBeVisible();
    // Owners get a delete flow, not a leave button.
    await expect(page.getByRole("button", { name: "Leave family" })).toHaveCount(0);

    await page.click('button:has-text("Delete family")');

    // Wrong confirmation text is rejected.
    await page.fill('input[name="confirmName"]', "not the right name");
    await page.click('button:has-text("Permanently delete")');
    await expect(page.getByText(/type ".*" exactly to confirm/i)).toBeVisible();

    const family = await prisma.family.findFirstOrThrow({ where: { name: "The Deleters" } });
    const stillExists = await prisma.family.findUnique({ where: { id: family.id } });
    expect(stillExists).not.toBeNull();

    // Correct confirmation deletes everything.
    await page.fill('input[name="confirmName"]', "The Deleters");
    await page.click('button:has-text("Permanently delete")');
    await page.waitForURL((url) => url.pathname === "/");

    const deletedFamily = await prisma.family.findUnique({ where: { id: family.id } });
    expect(deletedFamily).toBeNull();
    const deletedOwner = await prisma.user.findUnique({ where: { email: ownerEmail } });
    expect(deletedOwner).toBeNull();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
