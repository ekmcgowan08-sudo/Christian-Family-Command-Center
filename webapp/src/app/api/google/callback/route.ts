import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/lib/auth";
import { getGoogleOAuthClient } from "@/lib/google/oauth";
import { prisma } from "@/lib/prisma";

const STATE_COOKIE = "google_oauth_state";

export async function GET(req: NextRequest) {
  const dashboardUrl = new URL("/dashboard/integrations", process.env.NEXTAUTH_URL);

  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    dashboardUrl.searchParams.set("error", "google_state_mismatch");
    return NextResponse.redirect(dashboardUrl);
  }

  try {
    const client = getGoogleOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.access_token || !tokens.refresh_token) {
      // Google omits refresh_token if the user already granted consent
      // previously without revoking it -- prompt=consent should prevent
      // this, but guard anyway.
      dashboardUrl.searchParams.set("error", "google_missing_refresh_token");
      return NextResponse.redirect(dashboardUrl);
    }

    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const { data: profile } = await oauth2.userinfo.get();

    await prisma.googleAccount.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        googleEmail: profile.email ?? "unknown",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : new Date(Date.now() + 3600_000),
        grantedScopes: tokens.scope ?? "",
      },
      update: {
        googleEmail: profile.email ?? "unknown",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : new Date(Date.now() + 3600_000),
        grantedScopes: tokens.scope ?? "",
      },
    });

    dashboardUrl.searchParams.set("connected", "1");
  } catch (err) {
    console.error("Google OAuth callback failed", err);
    dashboardUrl.searchParams.set("error", "google_connect_failed");
  }

  const res = NextResponse.redirect(dashboardUrl);
  res.cookies.delete(STATE_COOKIE);
  return res;
}
