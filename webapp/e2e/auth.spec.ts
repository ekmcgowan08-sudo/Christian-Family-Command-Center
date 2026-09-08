import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, login, logout, prisma } from "./helpers";

test.describe("signup, login, logout, and route guarding", () => {
  test("unauthenticated visitors are redirected away from the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("signing up creates a family and its first owner, then signs them in", async ({
    page,
  }) => {
    const email = uniqueEmail("owner");
    await signupNewFamily(page, {
      familyName: "The Testersons",
      name: "Tess Testerson",
      email,
      password: "supersecret123",
    });

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("The Testersons", { exact: true })).toBeVisible();

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.role).toBe("OWNER");
    expect(user?.emailVerifiedAt).toBeNull();
  });

  test("logging out then back in returns to the dashboard", async ({ page }) => {
    const email = uniqueEmail("relogin");
    const password = "supersecret123";
    await signupNewFamily(page, {
      familyName: "The Relogins",
      name: "Rae Login",
      email,
      password,
    });

    await logout(page);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);

    await login(page, email, password);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("an incorrect password is rejected with a generic error", async ({ page }) => {
    const email = uniqueEmail("badpass");
    await signupNewFamily(page, {
      familyName: "The Badpasses",
      name: "Bad Pass",
      email,
      password: "supersecret123",
    });
    await logout(page);

    await login(page, email, "totally-wrong-password");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/incorrect email or password/i)).toBeVisible();
  });

  test("signup rejects a duplicate email address", async ({ page }) => {
    const email = uniqueEmail("dupe");
    await signupNewFamily(page, {
      familyName: "The Dupes",
      name: "Dupe One",
      email,
      password: "supersecret123",
    });
    await logout(page);

    await page.goto("/signup");
    await page.fill('input[name="familyName"]', "The Dupes Two");
    await page.fill('input[name="name"]', "Dupe Two");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "anotherpassword");
    await page.click('button[type="submit"]');

    await expect(page.getByText(/already exists/i)).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });
});
