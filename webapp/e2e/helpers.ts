import type { Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { TEST_DATABASE_URL, MAILDEV_API_URL } from "./env";

export const prisma = new PrismaClient({ datasources: { db: { url: TEST_DATABASE_URL } } });

let counter = 0;
/** A unique-per-run email so parallel/re-run tests never collide. */
export function uniqueEmail(label: string) {
  counter += 1;
  return `${label}-${Date.now()}-${counter}@example.com`;
}

type MailDevEmail = {
  to?: { address: string }[];
  subject?: string;
  html?: string;
  text?: string;
};

/** Polls MailDev's inbox for the newest email to `to` whose subject matches. */
export async function waitForEmail(
  to: string,
  subjectMatch: RegExp,
  timeoutMs = 10_000
): Promise<MailDevEmail> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(MAILDEV_API_URL);
    const emails: MailDevEmail[] = await res.json();
    const matches = emails.filter(
      (e) => e.to?.some((t) => t.address === to) && subjectMatch.test(e.subject || "")
    );
    if (matches.length > 0) return matches[matches.length - 1];
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for an email to ${to} matching ${subjectMatch}`);
}

/** Extracts a `?token=...` style link's token from an email body. */
export function extractToken(email: MailDevEmail, pathSegment: string): string {
  const body = email.html || email.text || "";
  const re = new RegExp(`${pathSegment}\\?token=([\\w-]+)`);
  const match = body.match(re);
  if (!match) throw new Error(`Could not find a ${pathSegment} token in email body: ${body}`);
  return match[1];
}

export async function signupNewFamily(
  page: Page,
  opts: { familyName: string; name: string; email: string; password: string }
) {
  await page.goto("/signup");
  await page.fill('input[name="familyName"]', opts.familyName);
  await page.fill('input[name="name"]', opts.name);
  await page.fill('input[name="email"]', opts.email);
  await page.fill('input[name="password"]', opts.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Log out" }).click();
  // The logout server action redirects to "/" -- wait for that navigation
  // to actually land before continuing, otherwise a subsequent
  // page.goto("/dashboard") can race the session cookie being cleared.
  await page.waitForURL((url) => url.pathname === "/");
}
