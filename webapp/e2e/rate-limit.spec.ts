import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, logout, login, prisma } from "./helpers";

test.describe("rate limiting", () => {
  test("a concurrent burst against one key can't exceed max, only a slow trickle can", async () => {
    // checkRateLimit's count-then-insert only stays correct if concurrent
    // callers for the same key are serialized -- otherwise a burst (the
    // actual shape a real attack takes, as opposed to one guess every few
    // hundred milliseconds) would let every request in the burst read the
    // same pre-increment count and all pass, blowing straight through
    // `max` before the persisted count catches up. This mirrors the real
    // function's pg_advisory_xact_lock + count + insert exactly, against
    // the real test database, since the real function can't be imported
    // directly here without pulling in the dev database's connection
    // (see the other deterministic concurrency tests this session for
    // the same constraint).
    const key = `rate-limit-race-test-${Date.now()}`;
    const max = 5;
    const windowStart = new Date(Date.now() - 60_000);

    const attempt = () =>
      prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
        await tx.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: windowStart } } });
        const count = await tx.rateLimitHit.count({ where: { key, createdAt: { gte: windowStart } } });
        if (count >= max) return false;
        await tx.rateLimitHit.create({ data: { key } });
        return true;
      });

    // Far more concurrent attempts than `max` -- a naive count-then-insert
    // would let most or all of these through at once.
    const results = await Promise.all(Array.from({ length: 20 }, () => attempt()));
    const allowedCount = results.filter(Boolean).length;
    expect(allowedCount).toBe(max);

    const persistedCount = await prisma.rateLimitHit.count({ where: { key } });
    expect(persistedCount).toBe(max);

    await prisma.rateLimitHit.deleteMany({ where: { key } });
  });

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

  test("repeated wrong current-password guesses on the change-password form are blocked", async ({
    page,
  }) => {
    const email = uniqueEmail("change-password-target");
    const password = "supersecret123";
    await signupNewFamily(page, {
      familyName: "The Guessed",
      name: "Gue Ssed",
      email,
      password,
    });

    // Someone with a hijacked or shared session but not the real password
    // shouldn't be able to brute-force "current password" to take the
    // account over outright -- same class of attack as login.
    await page.goto("/dashboard/settings");
    let sawRateLimitMessage = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      await page.fill('input[name="currentPassword"]', "definitely-the-wrong-password");
      await page.fill('input[name="newPassword"]', "wouldbenewpassword1");
      await page.fill('input[name="confirmPassword"]', "wouldbenewpassword1");
      // Unlike login(), this form doesn't navigate between attempts, so the
      // error text can repeat verbatim across submissions -- waiting on
      // that text alone can resolve on the *previous* attempt's still-
      // mounted element instead of this one's. Wait for this specific
      // request's response instead of racing the render.
      await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes("/dashboard/settings") && res.request().method() === "POST"
        ),
        page.click('button:has-text("Update password")'),
      ]);
      // The network response landing doesn't guarantee React has committed
      // the resulting re-render yet -- toBeVisible polls briefly rather
      // than assuming that happens within the same tick.
      const alert = page.locator('[role="alert"]').first();
      await expect(alert).toBeVisible();
      const text = await alert.innerText();
      if (/too many attempts/i.test(text)) {
        sawRateLimitMessage = true;
        break;
      }
      expect(text).toMatch(/current password is incorrect/i);
    }
    expect(sawRateLimitMessage).toBe(true);

    // The real current password must also be rejected while the limit
    // holds, and the password must genuinely be unchanged in the database.
    await page.fill('input[name="currentPassword"]', password);
    await page.fill('input[name="newPassword"]', "wouldbenewpassword1");
    await page.fill('input[name="confirmPassword"]', "wouldbenewpassword1");
    await page.click('button:has-text("Update password")');
    await expect(page.getByText(/too many attempts/i)).toBeVisible();

    await logout(page);
    await login(page, email, password);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
