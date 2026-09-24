"use client";

import { useIsClient } from "@/lib/use-is-client";

function formatRange(start: Date, end: Date, allDay: boolean) {
  if (allDay) {
    return start.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  const timeOpts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${start.toLocaleDateString(undefined, dateOpts)} · ${start.toLocaleTimeString(
    undefined,
    timeOpts
  )} - ${end.toLocaleTimeString(undefined, timeOpts)}`;
}

/**
 * Renders an event's start/end range in the viewer's own local timezone,
 * client-side only after mount -- see LocalDateTime for why formatting
 * can't safely happen during the server-rendered pass (the server could
 * be running in any timezone, not necessarily the family's).
 */
export function EventRangeLabel({
  start,
  end,
  allDay,
}: {
  start: Date;
  end: Date;
  allDay: boolean;
}) {
  const isClient = useIsClient();
  if (!isClient) return <>{" "}</>;
  return <>{formatRange(new Date(start), new Date(end), allDay)}</>;
}
