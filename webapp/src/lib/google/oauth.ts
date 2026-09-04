import { google } from "googleapis";

// Scopes requested when a family member connects their Google account.
// Calendar read access powers the shared family calendar; Gmail readonly
// powers the "recent email" glance on the dashboard. Neither scope lets
// this app send email or modify the user's calendar/inbox.
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
  "openid",
  "email",
];

export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, " +
        "and GOOGLE_REDIRECT_URI. See docs/GOOGLE_SETUP.md."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Builds the consent-screen URL for a given app user. The `state` param
 * carries the signed-in user's id so the callback route knows whose
 * GoogleAccount row to create, without relying on cookies alone.
 */
export function buildGoogleAuthUrl(state: string) {
  const client = getGoogleOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // ensures a refresh_token is returned every time
    scope: GOOGLE_SCOPES,
    state,
  });
}
