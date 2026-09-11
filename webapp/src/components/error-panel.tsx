import Link from "next/link";

export function ErrorPanel({
  onRetry,
  homeHref,
  homeLabel,
}: {
  onRetry: () => void;
  homeHref: string;
  homeLabel: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-brand-green">Something went wrong</h1>
        <p className="mt-2 text-sm text-foreground/70">
          That didn&apos;t work. You can try again, or head back.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-light"
          >
            Try again
          </button>
          <Link
            href={homeHref}
            className="rounded-full border border-brand-border px-4 py-2 text-sm font-medium text-foreground/70 transition hover:border-brand-green"
          >
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
