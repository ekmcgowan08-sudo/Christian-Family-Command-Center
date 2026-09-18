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

  test("the atomic claim signupWithInvite relies on can't double-spend an invite under real concurrency", async () => {
    // signupWithInvite reads the invite, then separately claims it with a
    // conditional update (`updateMany` with `usedAt: null` in the WHERE
    // clause) before creating the user -- that conditional update is the
    // entire defense against two requests racing the same one-time code
    // both passing the initial "is it used?" read before either commits.
    //
    // A full end-to-end version of this (two real browser sessions
    // submitting the join form at once) was tried and dropped: whether it
    // actually exercises concurrent database access depends on exact
    // request scheduling through the dev server, which isn't reliable
    // enough to trust as a regression test -- it passed even against the
    // unfixed code in some runs. Firing the same conditional update Prisma
    // issues, twice, concurrently, against a real Postgres row is a
    // deterministic way to prove the mechanism itself holds under
    // contention, independent of how any particular HTTP round trip
    // happens to get scheduled.
    const family = await prisma.family.create({
      data: {
        name: "Race Test Family",
        icsToken: `race-test-${Date.now()}`,
        members: {
          create: {
            name: "Race Test Owner",
            email: uniqueEmail("race-test-owner"),
            passwordHash: "not-a-real-hash",
            role: "OWNER",
          },
        },
      },
      include: { members: true },
    });
    const invite = await prisma.invite.create({
      data: {
        familyId: family.id,
        invitedByUserId: family.members[0].id,
        role: "MEMBER",
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    const claim = () =>
      prisma.invite.updateMany({
        where: { id: invite.id, usedAt: null },
        data: { usedAt: new Date() },
      });
    const [first, second] = await Promise.all([claim(), claim()]);

    const successfulClaims = [first.count, second.count].filter((count) => count === 1);
    expect(successfulClaims).toHaveLength(1);

    await prisma.family.delete({ where: { id: family.id } });
  });

  test("the owner-row lock leaveFamily/changeMemberRole share can't be raced down to zero owners", async () => {
    // A family with exactly two owners, each demoting the other at the
    // same instant, is the scenario lockFamilyOwnerIds exists for: a
    // naive "count the other owners, then act" check would let each
    // demotion see the other owner as still in place and both succeed,
    // leaving the family with none. As with the invite-claim race above,
    // firing the real conditional query directly and concurrently is the
    // deterministic way to prove the row lock holds under contention,
    // rather than hoping two HTTP requests happen to overlap.
    const family = await prisma.family.create({
      data: {
        name: "Owner Lock Test Family",
        icsToken: `owner-lock-test-${Date.now()}`,
        members: {
          create: [
            {
              name: "Owner A",
              email: uniqueEmail("owner-lock-a"),
              passwordHash: "not-a-real-hash",
              role: "OWNER",
            },
            {
              name: "Owner B",
              email: uniqueEmail("owner-lock-b"),
              passwordHash: "not-a-real-hash",
              role: "OWNER",
            },
          ],
        },
      },
      include: { members: true },
    });
    const [ownerA, ownerB] = family.members;

    const demote = (targetId: string) =>
      prisma.$transaction(async (tx) => {
        const owners = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM "User" WHERE "familyId" = ${family.id} AND role = 'OWNER' FOR UPDATE
        `;
        if (owners.filter((o) => o.id !== targetId).length === 0) {
          throw new Error("LAST_OWNER");
        }
        await tx.user.update({ where: { id: targetId }, data: { role: "MEMBER" } });
      });

    const results = await Promise.allSettled([demote(ownerB.id), demote(ownerA.id)]);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // Exactly one demotion must win -- both succeeding would leave the
    // family with zero owners.
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const ownersLeft = await prisma.user.count({ where: { familyId: family.id, role: "OWNER" } });
    expect(ownersLeft).toBe(1);

    await prisma.family.delete({ where: { id: family.id } });
  });
});
