"use client";

import { useActionState, useRef, useEffect } from "react";
import { changePassword } from "@/lib/actions/settings";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "success" in state) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="max-w-sm space-y-3 rounded-xl border border-brand-border bg-brand-card p-4"
    >
      <div>
        <label className="block text-sm font-medium">Current password</label>
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">New password</label>
        <input
          type="password"
          name="newPassword"
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Confirm new password</label>
        <input
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p className="text-sm text-green-700">Password updated.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-light disabled:opacity-60"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
