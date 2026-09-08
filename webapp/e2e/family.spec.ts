import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, prisma } from "./helpers";

test.describe("family invites and membership", () => {
  test("an invite code lets a second person join the same family, and the owner can remove them", async ({
    page,
    browser,
  }) => {
    const ownerEmail = uniqueEmail("owner-family");
    await signupNewFamily(page, {
      familyName: "The Joiners",
      name: "Owen Owner",
      email: ownerEmail,
      password: "supersecret123",
    });

    await page.goto("/dashboard/family");
    await page.selectOption('select[name="role"]', "MEMBER");
    await page.click('button:has-text("Create invite link")');
    await expect(page.getByText(/share this link/i)).toBeVisible();

    const family = await prisma.family.findFirstOrThrow({ where: { name: "The Joiners" } });
    const invite = await prisma.invite.findFirstOrThrow({
      where: { familyId: family.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    // Join as a second person, in a separate browser session.
    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    const memberEmail = uniqueEmail("member-family");
    await memberPage.goto(`/signup?code=${invite.code}`);
    await memberPage.fill('input[name="name"]', "Mia Member");
    await memberPage.fill('input[name="email"]', memberEmail);
    await memberPage.fill('input[name="password"]', "anotherpassword");
    await memberPage.click('button[type="submit"]');
    await memberPage.waitForURL("**/dashboard");
    await expect(memberPage.getByText("The Joiners", { exact: true })).toBeVisible();

    const memberUser = await prisma.user.findUniqueOrThrow({ where: { email: memberEmail } });
    expect(memberUser.familyId).toBe(family.id);
    expect(memberUser.role).toBe("MEMBER");

    // Owner sees both members and can remove the new one.
    await page.goto("/dashboard/family");
    await expect(page.getByText("Mia Member")).toBeVisible();

    const memberRow = page.locator("li", { hasText: "Mia Member" });
    await memberRow.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("Mia Member")).not.toBeVisible();

    const stillExists = await prisma.user.findUnique({ where: { email: memberEmail } });
    expect(stillExists).toBeNull();

    await memberContext.close();
  });

  test("a used or expired invite code cannot be reused, and a revoked invite disappears", async ({
    page,
    browser,
  }) => {
    const ownerEmail = uniqueEmail("owner-revoke");
    await signupNewFamily(page, {
      familyName: "The Revokers",
      name: "Rev Oker",
      email: ownerEmail,
      password: "supersecret123",
    });

    await page.goto("/dashboard/family");
    await page.click('button:has-text("Create invite link")');
    await expect(page.getByText(/share this link/i)).toBeVisible();

    const family = await prisma.family.findFirstOrThrow({ where: { name: "The Revokers" } });
    const invite = await prisma.invite.findFirstOrThrow({
      where: { familyId: family.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    await page.goto("/dashboard/family");
    await expect(page.getByText(/pending invites/i)).toBeVisible();
    await page.getByRole("button", { name: "Revoke" }).click();
    await expect(page.getByText(/pending invites/i)).not.toBeVisible();

    const revoked = await prisma.invite.findUnique({ where: { id: invite.id } });
    expect(revoked).toBeNull();

    const context = await browser.newContext();
    const joinPage = await context.newPage();
    await joinPage.goto(`/signup?code=${invite.code}`);
    await joinPage.fill('input[name="name"]', "Too Late");
    await joinPage.fill('input[name="email"]', uniqueEmail("too-late"));
    await joinPage.fill('input[name="password"]', "supersecret123");
    await joinPage.click('button[type="submit"]');
    await expect(joinPage.getByText(/doesn't exist/i)).toBeVisible();
    await context.close();
  });
});
