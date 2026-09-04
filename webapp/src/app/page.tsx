import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-3 text-sm font-semibold tracking-wide text-brand-gold uppercase">
        Christian Family Command Center
      </p>
      <h1 className="max-w-2xl text-4xl font-bold text-brand-green sm:text-5xl">
        One private dashboard for your whole family
      </h1>
      <p className="mt-5 max-w-xl text-base text-foreground/80">
        A shared calendar, connected Google accounts, and a family login for
        everyone &mdash; each member signs in on their own, and chooses what
        to share with the rest of the family.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/login"
          className="rounded-full border border-brand-green px-6 py-3 text-sm font-semibold text-brand-green transition hover:bg-brand-green hover:text-white"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-green-light"
        >
          Set up your family
        </Link>
      </div>
    </div>
  );
}
