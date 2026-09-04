import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteEvent } from "@/lib/actions/calendar";
import { AddEventForm } from "./add-event-form";

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

export default async function CalendarPage() {
  const session = await auth();
  if (!session) return null;

  const events = await prisma.calendarEvent.findMany({
    where: { familyId: session.user.familyId },
    orderBy: { startAt: "asc" },
    include: { createdBy: true },
  });

  const now = new Date();
  const upcoming = events.filter((e) => e.endAt >= now);
  const past = events.filter((e) => e.endAt < now).slice(-10).reverse();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-green">Family calendar</h1>
      <p className="mt-1 text-sm text-foreground/70">
        Everything here also appears in your family&apos;s phone calendar feed
        &mdash; see{" "}
        <a href="/dashboard/settings" className="underline">
          Settings
        </a>{" "}
        to subscribe on iOS or Android.
      </p>

      <div className="mt-6">
        <AddEventForm />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-brand-green">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">No upcoming events yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcoming.map((event) => (
              <li
                key={event.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-brand-border bg-brand-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-foreground/70">
                    {formatRange(event.startAt, event.endAt, event.allDay)}
                  </p>
                  {event.location && (
                    <p className="text-xs text-foreground/60">{event.location}</p>
                  )}
                  <p className="mt-1 text-xs text-brand-gold">
                    {event.source === "GOOGLE"
                      ? "Synced from Google Calendar"
                      : event.createdBy
                        ? `Added by ${event.createdBy.name}`
                        : "Added manually"}
                  </p>
                </div>
                {event.source === "MANUAL" && (
                  <form action={deleteEvent.bind(null, event.id)}>
                    <button
                      type="submit"
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {past.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-brand-green">Recently past</h2>
          <ul className="mt-3 space-y-2">
            {past.map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-brand-border bg-brand-card/60 px-4 py-3 text-sm text-foreground/60"
              >
                <span className="font-medium text-foreground/80">{event.title}</span>{" "}
                &middot; {formatRange(event.startAt, event.endAt, event.allDay)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
