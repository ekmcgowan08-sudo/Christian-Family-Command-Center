"use client";

import { useActionState } from "react";
import { resendVerificationEmail, type ResendResult } from "@/lib/actions/email-verification";

async function resendAction(): Promise<ResendResult> {
  return resendVerificationEmail();
}

export function VerifyBanner() {
  const [state, formAction, pending] = useActionState(resendAction, null);

  if (state && "success" in state) {
    return (
      <div className="mb-6 rounded-xl border border-brand-gold/40 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {state.message}
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-gold/40 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span>
        Please verify your email address so your family can reach you and you can reset your
        password if needed.
      </span>
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-amber-700/40 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
        >
          {pending ? "Sending..." : "Resend verification email"}
        </button>
      </form>
      {state && "error" in state && <p className="w-full text-xs text-red-700">{state.error}</p>}
    </div>
  );
}
