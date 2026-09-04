import { google } from "googleapis";
import type { GoogleAccount } from "@prisma/client";
import { getGoogleOAuthClient } from "./oauth";
import { prisma } from "@/lib/prisma";

/** Returns an OAuth2 client authorized for this user, persisting any refreshed access token. */
function getAuthorizedClient(account: GoogleAccount) {
  const client = getGoogleOAuthClient();
  client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    expiry_date: account.expiresAt.getTime(),
  });

  client.on("tokens", (tokens) => {
    if (tokens.access_token) {
      prisma.googleAccount
        .update({
          where: { id: account.id },
          data: {
            accessToken: tokens.access_token,
            expiresAt: tokens.expiry_date
              ? new Date(tokens.expiry_date)
              : new Date(Date.now() + 3600_000),
          },
        })
        .catch((err) => console.error("Failed to persist refreshed Google token", err));
    }
  });

  return client;
}

/**
 * Pulls upcoming events from this member's connected Google Calendar and
 * mirrors them into the family's CalendarEvent table (source = GOOGLE).
 * Only called for accounts that opted in via shareCalendar.
 */
export async function syncGoogleCalendarForUser(userId: string) {
  const account = await prisma.googleAccount.findUnique({
    where: { userId },
    include: { user: true },
  });
  if (!account || !account.shareCalendar) return { synced: 0 };

  const auth = getAuthorizedClient(account);
  const calendar = google.calendar({ version: "v3", auth });

  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 90); // sync a 90-day forward window

  const res = await calendar.events.list({
    calendarId: account.calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  const items = res.data.items ?? [];
  let synced = 0;

  for (const item of items) {
    if (!item.id || !item.status || item.status === "cancelled") continue;

    const start = item.start?.dateTime ?? item.start?.date;
    const end = item.end?.dateTime ?? item.end?.date;
    if (!start || !end) continue;

    const allDay = Boolean(item.start?.date && !item.start?.dateTime);

    await prisma.calendarEvent.upsert({
      where: {
        familyId_source_sourceUserId_sourceEventId: {
          familyId: account.user.familyId,
          source: "GOOGLE",
          sourceUserId: userId,
          sourceEventId: item.id,
        },
      },
      create: {
        familyId: account.user.familyId,
        title: item.summary || "(untitled event)",
        description: item.description ?? undefined,
        location: item.location ?? undefined,
        startAt: new Date(start),
        endAt: new Date(end),
        allDay,
        source: "GOOGLE",
        sourceUserId: userId,
        sourceEventId: item.id,
      },
      update: {
        title: item.summary || "(untitled event)",
        description: item.description ?? undefined,
        location: item.location ?? undefined,
        startAt: new Date(start),
        endAt: new Date(end),
        allDay,
      },
    });
    synced += 1;
  }

  await prisma.googleAccount.update({
    where: { id: account.id },
    data: { lastSyncedAt: new Date() },
  });

  return { synced };
}

export async function fetchRecentGmail(userId: string, max = 5) {
  const account = await prisma.googleAccount.findUnique({ where: { userId } });
  if (!account) return [];

  const auth = getAuthorizedClient(account);
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: max,
    labelIds: ["INBOX"],
  });

  const messages = list.data.messages ?? [];
  const details = await Promise.all(
    messages.map(async (m) => {
      if (!m.id) return null;
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: m.id,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });
      const headers = msg.data.payload?.headers ?? [];
      const get = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
      return {
        id: m.id,
        from: get("From"),
        subject: get("Subject") || "(no subject)",
        snippet: msg.data.snippet ?? "",
        date: get("Date"),
      };
    })
  );

  return details.filter((d): d is NonNullable<typeof d> => d !== null);
}
