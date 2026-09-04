import Link from "next/link";
import { auth } from "@/lib/auth";
import { logout } from "@/lib/actions/logout";

const NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/family", label: "Family" },
  { href: "/dashboard/integrations", label: "Connected accounts" },
  { href: "/dashboard/resources", label: "Resources" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex flex-col justify-between border-b border-brand-border bg-brand-green px-5 py-6 text-white md:min-h-full md:w-64 md:border-b-0 md:border-r">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
            {session?.user.familyName}
          </p>
          <nav className="mt-6 flex flex-row flex-wrap gap-1 md:flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-white/15 pt-4">
          <p className="truncate text-sm font-medium text-white">{session?.user.name}</p>
          <p className="truncate text-xs text-white/60">{session?.user.email}</p>
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-brand-cream px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
