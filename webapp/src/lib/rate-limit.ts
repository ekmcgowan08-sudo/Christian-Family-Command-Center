import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Fixed-window rate limiting backed by Postgres (not in-memory) so it
 * holds up across serverless invocations and multiple app instances --
 * this app already requires Postgres, so it's the one piece of shared
 * state every deployment target has.
 *
 * Returns true if the action is allowed (and records this attempt),
 * false if the caller has hit the limit and should be turned away.
 */
export async function checkRateLimit(
  key: string,
  opts: { max: number; windowMs: number }
): Promise<boolean> {
  const windowStart = new Date(Date.now() - opts.windowMs);

  // Sweep this key's own expired hits every time -- cheap, and keeps a
  // hot key's row count bounded to roughly `max` instead of growing
  // forever. A small random chance of a global sweep bounds the table
  // as a whole without needing a cron job for a low-traffic family app.
  await prisma.rateLimitHit.deleteMany({
    where: { key, createdAt: { lt: windowStart } },
  });
  if (Math.random() < 0.01) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.rateLimitHit.deleteMany({ where: { createdAt: { lt: dayAgo } } });
  }

  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: windowStart } },
  });
  if (count >= opts.max) {
    return false;
  }

  await prisma.rateLimitHit.create({ data: { key } });
  return true;
}

/**
 * Best-effort client IP from the standard reverse-proxy header. Vercel,
 * Railway, and Render all set this; a self-hosted Docker deployment gets
 * it too as soon as there's a reverse proxy (nginx, Caddy, Traefik) in
 * front for TLS, which is the normal way to expose a login form anyway.
 *
 * Returns null when there's genuinely no way to tell one client from
 * another (no proxy in front, e.g. local dev) -- callers should skip
 * IP-based limiting in that case rather than lumping every visitor into
 * one shared bucket, which would rate-limit unrelated real users against
 * each other instead of against nobody.
 */
export async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headerList.get("x-real-ip");
}

/**
 * Same as checkRateLimit, but for limits keyed on the client IP: when
 * `ip` is null (no reverse proxy in front to report one), this no-ops as
 * "allowed" instead of checking a shared bucket every unproxied visitor
 * would collide in.
 */
export async function checkIpRateLimit(
  keyPrefix: string,
  ip: string | null,
  opts: { max: number; windowMs: number }
): Promise<boolean> {
  if (!ip) return true;
  return checkRateLimit(`${keyPrefix}:${ip}`, opts);
}

export const RATE_LIMIT_MESSAGE = "Too many attempts. Please wait a bit and try again.";
