"use client";

import { useActionState, useState } from "react";
import { leaveFamily, deleteFamily } from "@/lib/actions/family";
import type { ActionResult } from "@/lib/actions/auth";

export function LeaveFamilyButton() {
  return (
    <form
      action={leaveFamily}
      onSubmit={(e) => {
        if (!confirm("Leave this family? You'll need a new invite to rejoin.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Leave family
      </button>
    </form>
  );
}

async function deleteFamilyAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return deleteFamily(null, formData);
}

export function DeleteFamilyForm({ familyName }: { familyName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(deleteFamilyAction, null);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete family
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-3 max-w-sm space-y-2">
      <label className="block text-sm font-medium">
        Type <span className="font-mono">{familyName}</span> to confirm
      </label>
      <input
        name="confirmName"
        required
        autoComplete="off"
        className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm outline-none focus:border-red-500"
      />
      {state && "error" in state && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "Deleting..." : "Permanently delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-brand-border px-4 py-1.5 text-sm font-medium text-foreground/70 hover:border-brand-green"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
