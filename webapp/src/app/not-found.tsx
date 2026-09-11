import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-brand-green">Page not found</h1>
        <p className="mt-2 text-sm text-foreground/70">
          That page doesn&apos;t exist, or you may not have access to it.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-light"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
