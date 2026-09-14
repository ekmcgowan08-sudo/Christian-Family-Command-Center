import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily } from "./helpers";

test.describe("Google OAuth callback edge cases", () => {
  test("declining Google's consent screen shows a clear message, not a state-mismatch error", async ({
    page,
  }) => {
    const email = uniqueEmail("google-deny");
    await signupNewFamily(page, {
      familyName: "The Decliners",
      name: "Dec Liner",
      email,
      password: "supersecret123",
    });

    // This is exactly what Google redirects back with when someone
    // clicks "Deny" on the consent screen: an `error` param and no
    // `code`, regardless of whether a state cookie is even present.
    await page.goto("/api/google/callback?error=access_denied&state=whatever");

    await expect(page).toHaveURL(/\/dashboard\/integrations\?error=google_access_denied/);
    await expect(page.getByText(/didn't grant access/i)).toBeVisible();
    await expect(page.getByText(/state mismatch|expired or was invalid/i)).not.toBeVisible();
  });

  test("a genuinely mismatched or missing state still gets its own distinct message", async ({
    page,
  }) => {
    const email = uniqueEmail("google-badstate");
    await signupNewFamily(page, {
      familyName: "The Mismatchers",
      name: "Mis Matcher",
      email,
      password: "supersecret123",
    });

    // A code with no matching state cookie at all (e.g. the connect flow
    // was never actually started in this browser).
    await page.goto("/api/google/callback?code=some-code&state=some-state");

    await expect(page).toHaveURL(/\/dashboard\/integrations\?error=google_state_mismatch/);
    await expect(page.getByText(/expired or was invalid/i)).toBeVisible();
  });
});
