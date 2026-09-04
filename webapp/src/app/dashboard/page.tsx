import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session) return null;

  const [upcomingEvents, memberCount, connectedCount, googleAccount] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: { familyId: session.user.familyId, startAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
      take: 5,
    }),
    prisma.user.count({ where: { familyId: session.user.familyId } }),
    prisma.googleAccount.count({
      where: { user: { familyId: session.user.familyId }, shareCalendar: true },
    }),
    prisma.googleAccount.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-brand-green">
        Welcome back, {(session.user.name ?? session.user.email ?? "there").split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-foreground/70">
        Here&apos;s what&apos;s coming up for the {session.user.familyName} family.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Family members" value={memberCount} href="/dashboard/family" />
        <StatCard
          label="Shared calendars"
          value={connectedCount}
          href="/dashboard/integrations"
        />
        <StatCard
          label="Your Google account"
          value={googleAccount ? "Connected" : "Not connected"}
          href="/dashboard/integrations"
        />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-green">Upcoming</h2>
          <Link href="/dashboard/calendar" className="text-sm font-medium text-brand-gold">
            View full calendar &rarr;
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-brand-border bg-brand-card p-6 text-sm text-foreground/60">
            Nothing on the calendar yet.{" "}
            <Link href="/dashboard/calendar" className="underline">
              Add your first event
            </Link>{" "}
            or connect a Google Calendar.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {upcomingEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  {event.location && (
                    <p className="text-xs text-foreground/60">{event.location}</p>
                  )}
                </div>
                <p className="text-sm text-foreground/70">
                  {event.allDay
                    ? event.startAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : event.startAt.toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-brand-border bg-brand-card p-4 transition hover:border-brand-green"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-brand-green">{value}</p>
    </Link>
  );
}
