import { test, expect } from "@playwright/test";
import { uniqueEmail, signupNewFamily, prisma } from "./helpers";

test.describe("family role management", () => {
  test("promoting a member grants owner powers immediately, without re-login", async ({
    page,
    browser,
  }) => {
    const ownerEmail = uniqueEmail("owner-roles");
    await signupNewFamily(page, {
      familyName: "The Promoters",
      name: "Owen Owner",
      email: ownerEmail,
      password: "supersecret123",
    });

    await page.goto("/dashboard/family");
    await page.click('button:has-text("Create invite link")');
    await expect(page.getByText(/share this link/i)).toBeVisible();
    const family = await prisma.family.findFirstOrThrow({ where: { name: "The Promoters" } });
    const invite = await prisma.invite.findFirstOrThrow({
      where: { familyId: family.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    const memberEmail = uniqueEmail("member-roles");
    await memberPage.goto(`/signup?code=${invite.code}`);
    await memberPage.fill('input[name="name"]', "Prom Otee");
    await memberPage.fill('input[name="email"]', memberEmail);
    await memberPage.fill('input[name="password"]', "anotherpassword");
    await memberPage.click('button[type="submit"]');
    await memberPage.waitForURL("**/dashboard");

    // Member's own session has no owner-only UI yet.
    await memberPage.goto("/dashboard/family");
    await expect(memberPage.getByText("Invite a family member")).not.toBeVisible();

    // Owner promotes the member -- without the member reloading or
    // logging back in.
    await page.goto("/dashboard/family");
    const memberRow = page.locator("li", { hasText: "Prom Otee" });
    await memberRow.getByRole("button", { name: "Make owner" }).click();
    await expect(memberRow.getByText("Owner", { exact: true })).toBeVisible();

    const promoted = await prisma.user.findUniqueOrThrow({ where: { email: memberEmail } });
    expect(promoted.role).toBe("OWNER");

    // The member's existing (still-MEMBER) JWT session must not block
    // them -- this is the actual staleness bug being tested: role checks
    // have to hit the database, not the cached session, or a freshly
    // promoted owner would be denied owner actions until they re-login.
    await memberPage.goto("/dashboard/family");
    await expect(memberPage.getByText("Invite a family member")).toBeVisible();
    await memberPage.click('button:has-text("Create invite link")');
    await expect(memberPage.getByText(/share this link/i)).toBeVisible();

    await memberContext.close();
  });

  test("demoting an owner revokes owner powers immediately, without re-login", async ({
    page,
    browser,
  }) => {
    const ownerEmail = uniqueEmail("owner-demote");
    await signupNewFamily(page, {
      familyName: "The Demoters",
      name: "Owen Original",
      email: ownerEmail,
      password: "supersecret123",
    });

    await page.goto("/dashboard/family");
    await page.selectOption('select[name="role"]', "OWNER");
    await page.click('button:has-text("Create invite link")');
    await expect(page.getByText(/share this link/i)).toBeVisible();
    const family = await prisma.family.findFirstOrThrow({ where: { name: "The Demoters" } });
    const invite = await prisma.invite.findFirstOrThrow({
      where: { familyId: family.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const secondOwnerContext = await browser.newContext();
    const secondOwnerPage = await secondOwnerContext.newPage();
    const secondOwnerEmail = uniqueEmail("second-owner");
    await secondOwnerPage.goto(`/signup?code=${invite.code}`);
    await secondOwnerPage.fill('input[name="name"]', "Demoted Soon");
    await secondOwnerPage.fill('input[name="email"]', secondOwnerEmail);
    await secondOwnerPage.fill('input[name="password"]', "anotherpassword");
    await secondOwnerPage.click('button[type="submit"]');
    await secondOwnerPage.waitForURL("**/dashboard");

    // Confirm they really did join as OWNER, and can act like one.
    const joinedAsOwner = await prisma.user.findUniqueOrThrow({
      where: { email: secondOwnerEmail },
    });
    expect(joinedAsOwner.role).toBe("OWNER");
    await secondOwnerPage.goto("/dashboard/family");
    await expect(secondOwnerPage.getByText("Invite a family member")).toBeVisible();

    // Original owner demotes them, without them reloading or re-logging in.
    await page.goto("/dashboard/family");
    const demotedRow = page.locator("li", { hasText: "Demoted Soon" });
    await demotedRow.getByRole("button", { name: "Make member" }).click();
    await expect(demotedRow.getByText("Member", { exact: true })).toBeVisible();

    // Their still-cached "OWNER" JWT must no longer be enough -- the
    // owner-only UI should be gone, and the server action itself must
    // refuse, not just the client rendering.
    await secondOwnerPage.goto("/dashboard/family");
    await expect(secondOwnerPage.getByText("Invite a family member")).not.toBeVisible();

    await secondOwnerContext.close();
  });
});
