"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signupNewFamily, signupWithInvite } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"new" | "invite">(
    searchParams.get("code") ? "invite" : "new"
  );

  const [newState, newFormAction, newPending] = useActionState(signupNewFamily, null);
  const [inviteState, inviteFormAction, invitePending] = useActionState(
    signupWithInvite,
    null
  );

  const state = mode === "new" ? newState : inviteState;

  useEffect(() => {
    if (state && "success" in state) {
      router.push("/dashboard");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-green">Set up your family</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Start a new family dashboard, or join one you&apos;ve been invited to.
        </p>

        <div className="mt-6 flex rounded-full border border-brand-border p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`flex-1 rounded-full py-1.5 font-medium transition ${
              mode === "new" ? "bg-brand-green text-white" : "text-foreground/70"
            }`}
          >
            Start a family
          </button>
          <button
            type="button"
            onClick={() => setMode("invite")}
            className={`flex-1 rounded-full py-1.5 font-medium transition ${
              mode === "invite" ? "bg-brand-green text-white" : "text-foreground/70"
            }`}
          >
            Join with invite
          </button>
        </div>

        {mode === "new" ? (
          <form action={newFormAction} className="mt-6 space-y-4">
            <Field id="familyName" label="Family name" placeholder="The Morgans" />
            <Field id="name" label="Your name" autoComplete="name" />
            <Field id="email" label="Email" type="email" autoComplete="email" />
            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters."
            />
            <ErrorText state={newState} />
            <SubmitButton pending={newPending} label="Create our family dashboard" />
          </form>
        ) : (
          <form action={inviteFormAction} className="mt-6 space-y-4">
            <Field
              id="code"
              label="Invite code"
              defaultValue={searchParams.get("code") ?? ""}
            />
            <Field id="name" label="Your name" autoComplete="name" />
            <Field id="email" label="Email" type="email" autoComplete="email" />
            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters."
            />
            <ErrorText state={inviteState} />
            <SubmitButton pending={invitePending} label="Join the family" />
          </form>
        )}

        <p className="mt-6 text-center text-sm text-foreground/70">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-green underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  hint,
  defaultValue,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-green"
      />
      {hint && <p className="mt-1 text-xs text-foreground/60">{hint}</p>}
    </div>
  );
}

function ErrorText({ state }: { state: { error: string } | { success: true } | null }) {
  if (!state || !("error" in state)) return null;
  return (
    <p className="text-sm text-red-600" role="alert">
      {state.error}
    </p>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-light disabled:opacity-60"
    >
      {pending ? "Please wait..." : label}
    </button>
  );
}
