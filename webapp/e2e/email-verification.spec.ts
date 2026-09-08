import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, waitForEmail, extractToken, prisma } from "./helpers";

test.describe("email verification", () => {
  test("signing up sends a verification email; visiting the link clears the reminder banner", async ({
    page,
  }) => {
    const email = uniqueEmail("verify");
    await signupNewFamily(page, {
      familyName: "The Verifiers",
      name: "Val Verifier",
      email,
      password: "supersecret123",
    });

    await expect(page.getByText(/verify your email address/i)).toBeVisible();

    const verifyEmail = await waitForEmail(email, /confirm your email/i);
    const token = extractToken(verifyEmail, "verify-email");

    await page.goto(`/verify-email?token=${token}`);
    await expect(page.getByText(/email address is confirmed/i)).toBeVisible();

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(user.emailVerifiedAt).not.toBeNull();

    await page.goto("/dashboard");
    await expect(page.getByText(/verify your email address/i)).not.toBeVisible();

    await page.goto("/dashboard/settings");
    await expect(page.getByText(/your email address is verified/i)).toBeVisible();
  });

  test("an already-used verification token shows an error instead of silently succeeding", async ({
    page,
  }) => {
    const email = uniqueEmail("verify-reuse");
    await signupNewFamily(page, {
      familyName: "The Reverifiers",
      name: "Rev Erifier",
      email,
      password: "supersecret123",
    });

    const verifyEmail = await waitForEmail(email, /confirm your email/i);
    const token = extractToken(verifyEmail, "verify-email");

    await page.goto(`/verify-email?token=${token}`);
    await expect(page.getByText(/email address is confirmed/i)).toBeVisible();

    await page.goto(`/verify-email?token=${token}`);
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });

  test("the resend button on Settings issues a new token and sends another email", async ({
    page,
  }) => {
    const email = uniqueEmail("verify-resend");
    await signupNewFamily(page, {
      familyName: "The Resenders",
      name: "Res Ender",
      email,
      password: "supersecret123",
    });
    await waitForEmail(email, /confirm your email/i);

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const before = await prisma.emailVerificationToken.count({ where: { userId: user.id } });

    await page.goto("/dashboard/settings");
    await page.click('button:has-text("Resend verification email")');
    await expect(page.getByText(/check your inbox/i)).toBeVisible();

    await expect
      .poll(() => prisma.emailVerificationToken.count({ where: { userId: user.id } }))
      .toBe(before + 1);

    const latestToken = await prisma.emailVerificationToken.findFirstOrThrow({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    await page.goto(`/verify-email?token=${latestToken.token}`);
    await expect(page.getByText(/email address is confirmed/i)).toBeVisible();
  });
});
