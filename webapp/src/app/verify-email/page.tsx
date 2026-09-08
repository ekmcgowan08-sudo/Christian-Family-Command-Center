"use client";

import { Suspense, startTransition, useActionState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/actions/email-verification";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, pending] = useActionState(verifyEmail, null);
  const submitted = useRef(false);

  useEffect(() => {
    if (token && !submitted.current) {
      submitted.current = true;
      const formData = new FormData();
      formData.set("token", token);
      startTransition(() => {
        formAction(formData);
      });
    }
  }, [token, formAction]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-card p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-brand-green">Confirm your email</h1>

        {!token ? (
          <p className="mt-4 text-sm text-red-600">
            This link is missing its verification token. You can request a new one from Settings.
          </p>
        ) : pending || !state ? (
          <p className="mt-4 text-sm text-gray-600">Confirming your email address...</p>
        ) : "success" in state ? (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-3 text-sm text-green-800">
            Your email address is confirmed. Thanks!
          </p>
        ) : (
          <p className="mt-4 text-sm text-red-600">{state.error}</p>
        )}

        <Link
          href="/dashboard"
          className="mt-6 block w-full rounded-full bg-brand-green px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-green-light"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
