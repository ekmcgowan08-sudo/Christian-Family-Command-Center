import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regenerateIcsToken } from "@/lib/actions/settings";
import { ChangePasswordForm } from "./change-password-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) return null;

  const family = await prisma.family.findUniqueOrThrow({
    where: { id: session.user.familyId },
  });

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const feedUrl = `${protocol}://${host}/api/feed/${family.icsToken}.ics`;
  const webcalUrl = feedUrl.replace(/^https?:\/\//, "webcal://");

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-green">Settings</h1>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-brand-green">Phone calendar sync</h2>
        <p className="mt-1 text-sm text-foreground/70">
          Subscribe to this link once from your phone&apos;s Calendar app and
          the whole family calendar stays in sync automatically &mdash; on
          iOS (Settings &rarr; Calendar &rarr; Accounts &rarr; Add
          Subscribed Calendar) and Android (Google Calendar &rarr; Settings
          &rarr; Add calendar &rarr; From URL).
        </p>
        <div className="mt-3 rounded-lg border border-brand-border bg-brand-card px-3 py-2">
          <p className="break-all font-mono text-xs text-brand-green">{webcalUrl}</p>
        </div>
        <p className="mt-2 text-xs text-foreground/60">
          Anyone with this link can view the family calendar, so only share it
          with your family. If it ever leaks, regenerate it below.
        </p>
        {session.user.role === "OWNER" && (
          <form action={regenerateIcsToken} className="mt-3">
            <button
              type="submit"
              className="rounded-full border border-brand-border px-4 py-1.5 text-sm font-medium text-foreground/70 hover:border-red-400 hover:text-red-600"
            >
              Regenerate link
            </button>
          </form>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-brand-green">Password</h2>
        <p className="mt-1 text-sm text-foreground/70">Update your own login password.</p>
        <div className="mt-3">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
