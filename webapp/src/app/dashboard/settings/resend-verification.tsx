"use client";

import { useActionState } from "react";
import { resendVerificationEmail, type ResendResult } from "@/lib/actions/email-verification";

async function resendAction(): Promise<ResendResult> {
  return resendVerificationEmail();
}

export function ResendVerification() {
  const [state, formAction, pending] = useActionState(resendAction, null);

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-brand-border px-4 py-1.5 text-sm font-medium text-foreground/70 hover:border-brand-green hover:text-brand-green disabled:opacity-60"
        >
          {pending ? "Sending..." : "Resend verification email"}
        </button>
      </form>
      {state && "success" in state && (
        <p className="mt-2 text-sm text-green-700">{state.message}</p>
      )}
      {state && "error" in state && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
