"use client";

import { useIsClient } from "@/lib/use-is-client";

/**
 * Formats a Date in the viewer's own local timezone. Rendered client-side
 * only, after mount: the initial server-rendered pass has no way to know
 * the viewer's real timezone (the server itself could be running
 * anywhere -- most cloud hosts default to UTC), and formatting during
 * that pass would silently use the server's own ambient timezone
 * instead of the browser's, showing every family member the wrong time
 * for the same event if the server isn't in their timezone.
 */
export function LocalDateTime({
  date,
  options,
  fallback = " ",
}: {
  date: Date;
  options: Intl.DateTimeFormatOptions;
  fallback?: string;
}) {
  const isClient = useIsClient();
  if (!isClient) return <>{fallback}</>;
  return <>{new Date(date).toLocaleString(undefined, options)}</>;
}
