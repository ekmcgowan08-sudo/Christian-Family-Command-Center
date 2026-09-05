"use client";

import { useActionState, useState } from "react";
import { deleteEvent, updateEvent } from "@/lib/actions/calendar";

type EventItemProps = {
  event: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    startAt: Date;
    endAt: Date;
    allDay: boolean;
    source: "MANUAL" | "GOOGLE";
    createdBy: { name: string } | null;
  };
};

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

// Formats a Date for a <input type="datetime-local"> value in local time.
function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function EventItem({ event }: EventItemProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateEvent, null);

  // Close the edit form the moment a save succeeds. Adjusting state during
  // render (rather than in a useEffect) avoids the extra commit-then-effect
  // render pass -- see https://react.dev/learn/you-might-not-need-an-effect.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state && "success" in state) setEditing(false);
  }

  if (event.source === "MANUAL" && editing) {
    return (
      <li className="rounded-xl border border-brand-green bg-brand-card p-4">
        <form action={formAction} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="eventId" value={event.id} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Title</label>
            <input
              name="title"
              required
              defaultValue={event.title}
              className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Starts</label>
            <input
              type="datetime-local"
              name="startAt"
              required
              defaultValue={toLocalInputValue(event.startAt)}
              className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Ends</label>
            <input
              type="datetime-local"
              name="endAt"
              required
              defaultValue={toLocalInputValue(event.endAt)}
              className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Location (optional)</label>
            <input
              name="location"
              defaultValue={event.location ?? ""}
              className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Notes (optional)</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={event.description ?? ""}
              className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="allDay"
              defaultChecked={event.allDay}
              className="rounded border-brand-border"
            />
            All-day event
          </label>

          {state && "error" in state && (
            <p className="text-sm text-red-600 sm:col-span-2" role="alert">
              {state.error}
            </p>
          )}

          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-light disabled:opacity-60"
            >
              {pending ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-brand-border px-5 py-2 text-sm font-medium text-foreground/70 hover:border-brand-green"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border border-brand-border bg-brand-card px-4 py-3">
      <div>
        <p className="font-medium">{event.title}</p>
        <p className="text-sm text-foreground/70">
          {formatRange(event.startAt, event.endAt, event.allDay)}
        </p>
        {event.location && <p className="text-xs text-foreground/60">{event.location}</p>}
        {event.description && (
          <p className="mt-1 text-sm text-foreground/70">{event.description}</p>
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
        <div className="flex shrink-0 gap-3 text-xs font-medium">
          <button onClick={() => setEditing(true)} className="text-brand-green hover:underline">
            Edit
          </button>
          <form action={deleteEvent.bind(null, event.id)}>
            <button type="submit" className="text-red-600 hover:underline">
              Remove
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
