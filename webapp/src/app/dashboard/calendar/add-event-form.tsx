"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { createEvent } from "@/lib/actions/calendar";
import { localInputValueToUtcIso } from "@/lib/datetime";

export function AddEventForm() {
  const [state, formAction, pending] = useActionState(createEvent, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  // Clear the datetime fields' own local state the moment a save
  // succeeds, adjusted during render rather than in an effect -- see
  // EventItem's handledState for the same pattern and why.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state && "success" in state) {
      setStartAt("");
      setEndAt("");
    }
  }

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 rounded-xl border border-brand-border bg-brand-card p-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium">Title</label>
        <input
          name="title"
          required
          className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
          placeholder="Soccer practice"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Starts</label>
        <input
          type="datetime-local"
          required
          data-testid="startAt"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
        />
        {/* The visible input above is deliberately unnamed -- its raw
            value has no timezone info and would be misread if parsed on
            the server, which can be running in any timezone. This hidden
            input carries the same instant as a real UTC ISO string,
            computed here in the browser where the local timezone is
            actually known. */}
        <input type="hidden" name="startAt" value={localInputValueToUtcIso(startAt)} />
      </div>
      <div>
        <label className="block text-sm font-medium">Ends</label>
        <input
          type="datetime-local"
          required
          data-testid="endAt"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
        />
        <input type="hidden" name="endAt" value={localInputValueToUtcIso(endAt)} />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium">Location (optional)</label>
        <input
          name="location"
          className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium">Notes (optional)</label>
        <textarea
          name="description"
          rows={2}
          className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
        />
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="allDay" className="rounded border-brand-border" />
        All-day event
      </label>

      {state && "error" in state && (
        <p className="text-sm text-red-600 sm:col-span-2" role="alert">
          {state.error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-light disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add to family calendar"}
        </button>
      </div>
    </form>
  );
}
