import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, login, logout, waitForEmail, extractToken } from "./helpers";

test.describe("password reset via real email", () => {
  test("requesting a reset, using the emailed link, and logging in with the new password", async ({
    page,
  }) => {
    const email = uniqueEmail("reset");
    const oldPassword = "supersecret123";
    const newPassword = "brandnewpassword456";

    await signupNewFamily(page, {
      familyName: "The Resetters",
      name: "Rita Reset",
      email,
      password: oldPassword,
    });
    await logout(page);

    await page.goto("/forgot-password");
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Send reset link")');
    await expect(page.getByText(/if that email/i)).toBeVisible();

    const resetEmail = await waitForEmail(email, /reset your password/i);
    const token = extractToken(resetEmail, "reset-password");

    await page.goto(`/reset-password?token=${token}`);
    await page.fill('input[name="newPassword"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);
    await page.click('button:has-text("Reset password")');
    await expect(page.getByText(/your password has been reset/i)).toBeVisible();

    // Old password no longer works.
    await login(page, email, oldPassword);
    await expect(page.getByText(/incorrect email or password/i)).toBeVisible();

    // New password works.
    await login(page, email, newPassword);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("a reset token cannot be reused a second time", async ({ page }) => {
    const email = uniqueEmail("reset-reuse");
    await signupNewFamily(page, {
      familyName: "The Reusers",
      name: "Reu Ser",
      email,
      password: "supersecret123",
    });
    await logout(page);

    await page.goto("/forgot-password");
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Send reset link")');

    const resetEmail = await waitForEmail(email, /reset your password/i);
    const token = extractToken(resetEmail, "reset-password");

    await page.goto(`/reset-password?token=${token}`);
    await page.fill('input[name="newPassword"]', "firstnewpassword");
    await page.fill('input[name="confirmPassword"]', "firstnewpassword");
    await page.click('button:has-text("Reset password")');
    await expect(page.getByText(/your password has been reset/i)).toBeVisible();

    await page.goto(`/reset-password?token=${token}`);
    await page.fill('input[name="newPassword"]', "secondnewpassword");
    await page.fill('input[name="confirmPassword"]', "secondnewpassword");
    await page.click('button:has-text("Reset password")');
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test("requesting a reset for an unknown email shows the same generic message", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.fill('input[name="email"]', uniqueEmail("nobody-here"));
    await page.click('button:has-text("Send reset link")');
    await expect(page.getByText(/if that email/i)).toBeVisible();
  });
});
