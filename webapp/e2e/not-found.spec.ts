import { test, expect } from "@playwright/test";

test.describe("unknown routes", () => {
  test("shows a branded 404 page instead of Next's default", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.click('text=Go to dashboard');
    // Unauthenticated, so the dashboard's own auth guard should take over.
    await expect(page).toHaveURL(/\/login/);
  });
});
