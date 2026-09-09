import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, logout, login } from "./helpers";

test.describe("rate limiting", () => {
  test("repeated failed logins against one account are eventually blocked", async ({ page }) => {
    const email = uniqueEmail("brute-force-target");
    const password = "supersecret123";
    await signupNewFamily(page, {
      familyName: "The Bruteforced",
      name: "Vic Tim",
      email,
      password,
    });
    await logout(page);

    // The account-level login limit is 8 attempts per 15 minutes -- drive
    // past it with wrong passwords and confirm the response changes from
    // "wrong password" to "too many attempts" rather than allowing
    // unlimited guesses.
    let sawRateLimitMessage = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      await login(page, email, "definitely-the-wrong-password");
      // The action is pending (button reads "Logging in...") until the
      // server responds -- wait for either error message to actually
      // render instead of racing the request.
      const alert = page.getByText(/incorrect email or password|too many attempts/i);
      await alert.waitFor();
      const text = await alert.innerText();
      if (/too many attempts/i.test(text)) {
        sawRateLimitMessage = true;
        break;
      }
    }
    expect(sawRateLimitMessage).toBe(true);

    // The real password must also be rejected while the limit holds --
    // otherwise this would only be throttling wrong guesses, not actually
    // protecting the account.
    await login(page, email, password);
    await expect(page.getByText(/too many attempts/i)).toBeVisible();
  });
});
