import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { buildGoogleAuthUrl, isGoogleConfigured } from "@/lib/google/oauth";

const STATE_COOKIE = "google_oauth_state";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }

  if (!isGoogleConfigured()) {
    const url = new URL("/dashboard/integrations", process.env.NEXTAUTH_URL);
    url.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(url);
  }

  const state = randomUUID();
  const authUrl = buildGoogleAuthUrl(state);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
