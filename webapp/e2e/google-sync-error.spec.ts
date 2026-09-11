import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, prisma } from "./helpers";

test.describe("Google sync failure handling", () => {
  test("a sync failure redirects to a friendly message instead of crashing the dashboard", async ({
    page,
  }) => {
    const email = uniqueEmail("google-sync");
    await signupNewFamily(page, {
      familyName: "The Syncfailures",
      name: "Syn Cfailure",
      email,
      password: "supersecret123",
    });

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    // Simulate a member who connected Google at some point -- the row's
    // token values don't matter here, since GOOGLE_CLIENT_ID is empty in
    // this test environment, sync fails before ever making a network
    // call, at the exact same point it would fail for a real revoked or
    // expired token in production.
    await prisma.googleAccount.create({
      data: {
        userId: user.id,
        googleEmail: "fake@example.com",
        accessToken: "fake-access-token",
        refreshToken: "fake-refresh-token",
        expiresAt: new Date(Date.now() + 3600_000),
        grantedScopes: "calendar.readonly gmail.readonly",
        shareCalendar: true,
      },
    });

    await page.goto("/dashboard/integrations");
    await expect(page.getByText(/connected as fake@example.com/i)).toBeVisible();

    await page.click('button:has-text("Sync now")');

    // Should land back on Settings/Integrations with the friendly error,
    // not Next's generic crashed-page fallback.
    await expect(page).toHaveURL(/\/dashboard\/integrations\?error=google_sync_failed/);
    await expect(
      page.getByText(/couldn't sync your google calendar/i)
    ).toBeVisible();

    // The rest of the dashboard must still be usable -- a sync failure
    // for one member's Google account should never take down navigation.
    await page.goto("/dashboard/calendar");
    await expect(page.getByRole("heading", { name: "Family calendar" })).toBeVisible();
  });
});
