"use client";

import { useActionState } from "react";
import { createInvite } from "@/lib/actions/family";

export function InviteForm() {
  const [state, formAction, pending] = useActionState(createInvite, null);

  const inviteUrl =
    state && "code" in state && typeof window !== "undefined"
      ? `${window.location.origin}/signup?code=${state.code}`
      : null;

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-4">
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium">Email (optional)</label>
          <input
            name="email"
            type="email"
            placeholder="dad@example.com"
            className="mt-1 rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            name="role"
            className="mt-1 rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
          >
            <option value="MEMBER">Member</option>
            <option value="OWNER">Owner</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-light disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create invite link"}
        </button>
      </form>

      {state && "error" in state && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      {inviteUrl && (
        <div className="mt-3 rounded-lg bg-brand-cream px-3 py-2 text-sm">
          <p className="text-foreground/70">Share this link (expires in 14 days):</p>
          <p className="mt-1 break-all font-mono text-xs text-brand-green">{inviteUrl}</p>
        </div>
      )}
    </div>
  );
}
