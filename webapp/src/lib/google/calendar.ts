import { google } from "googleapis";
import type { GoogleAccount, PrismaClient } from "@prisma/client";
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

type GoogleEventSummary = {
  id?: string | null;
  status?: string | null;
  summary?: string | null;
  description?: string | null;
  location?: string | null;
  start?: { date?: string | null; dateTime?: string | null } | null;
  end?: { date?: string | null; dateTime?: string | null } | null;
};

/**
 * Upserts the given Google Calendar items into the family's CalendarEvent
 * table, then prunes this member's previously-synced events that are no
 * longer present in the fetched window -- deleted, cancelled, or
 * rescheduled out of range at the source, none of which show up in
 * `items` on a plain (non-incremental) events.list call. Without this,
 * a deleted Google event stayed on the family calendar forever, since
 * the sync only ever created/updated, never removed.
 *
 * The prune is scoped to `endAt >= timeMin` so past events are never
 * touched -- the calendar page's "Recently past" section is meant to be
 * a standing archive, not something a sync should be able to wipe out.
 *
 * Split out from syncGoogleCalendarForUser, and takes `db` as a
 * parameter (defaulting to the real client), so this merge/prune logic
 * can be exercised directly against a real database in tests without
 * needing a live Google API call.
 */
export async function mergeGoogleEventsIntoFamilyCalendar(
  opts: { familyId: string; userId: string; timeMin: Date; items: GoogleEventSummary[] },
  db: Pick<PrismaClient, "calendarEvent"> = prisma
): Promise<{ synced: number }> {
  const { familyId, userId, timeMin, items } = opts;
  let synced = 0;
  const syncedEventIds: string[] = [];

  for (const item of items) {
    if (!item.id || !item.status || item.status === "cancelled") continue;

    const start = item.start?.dateTime ?? item.start?.date;
    const end = item.end?.dateTime ?? item.end?.date;
    if (!start || !end) continue;

    const allDay = Boolean(item.start?.date && !item.start?.dateTime);

    await db.calendarEvent.upsert({
      where: {
        familyId_source_sourceUserId_sourceEventId: {
          familyId,
          source: "GOOGLE",
          sourceUserId: userId,
          sourceEventId: item.id,
        },
      },
      create: {
        familyId,
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
    syncedEventIds.push(item.id);
    synced += 1;
  }

  await db.calendarEvent.deleteMany({
    where: {
      familyId,
      source: "GOOGLE",
      sourceUserId: userId,
      endAt: { gte: timeMin },
      sourceEventId: { notIn: syncedEventIds },
    },
  });

  return { synced };
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

  const result = await mergeGoogleEventsIntoFamilyCalendar({
    familyId: account.user.familyId,
    userId,
    timeMin,
    items: res.data.items ?? [],
  });

  await prisma.googleAccount.update({
    where: { id: account.id },
    data: { lastSyncedAt: new Date() },
  });

  return result;
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
