import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddEventForm } from "./add-event-form";
import { EventItem } from "./event-item";
import { EventRangeLabel } from "./event-range-label";

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
              <EventItem key={event.id} event={event} />
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
                &middot;{" "}
                <EventRangeLabel start={event.startAt} end={event.endAt} allDay={event.allDay} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
