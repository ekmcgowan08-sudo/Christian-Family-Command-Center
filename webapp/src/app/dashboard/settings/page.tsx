import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regenerateIcsToken } from "@/lib/actions/settings";
import { isEmailConfigured } from "@/lib/email";
import { ChangePasswordForm } from "./change-password-form";
import { ResendVerification } from "./resend-verification";
import { LeaveFamilyButton, DeleteFamilyForm } from "./danger-zone";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) return null;

  const family = await prisma.family.findUniqueOrThrow({
    where: { id: session.user.familyId },
  });

  // Role read fresh from the database, not session.user.role -- see the
  // comment on the equivalent lookup in dashboard/family/page.tsx.
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerifiedAt: true, role: true },
  });
  const isOwner = currentUser?.role === "OWNER";
  const emailConfigured = isEmailConfigured();
  const memberCount = await prisma.user.count({ where: { familyId: session.user.familyId } });

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
        {isOwner && (
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

      {emailConfigured && (
        <section>
          <h2 className="text-lg font-semibold text-brand-green">Email verification</h2>
          {currentUser?.emailVerifiedAt ? (
            <p className="mt-1 text-sm text-green-700">Your email address is verified.</p>
          ) : (
            <>
              <p className="mt-1 text-sm text-foreground/70">
                Your email address hasn&apos;t been confirmed yet. Verifying it means your family
                can reach you and you can reset your password if you ever need to.
              </p>
              <div className="mt-3">
                <ResendVerification />
              </div>
            </>
          )}
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-brand-green">Password</h2>
        <p className="mt-1 text-sm text-foreground/70">Update your own login password.</p>
        <div className="mt-3">
          <ChangePasswordForm />
        </div>
      </section>

      <section className="rounded-xl border border-red-200 bg-red-50/40 p-5">
        <h2 className="text-lg font-semibold text-red-700">Danger zone</h2>
        {isOwner ? (
          <>
            <p className="mt-1 text-sm text-foreground/70">
              Permanently delete {family.name}
              {memberCount > 1
                ? ` and all ${memberCount} members' data`
                : ""}{" "}
              &mdash; every event, invite, and connected account. This can&apos;t be undone.
            </p>
            <div className="mt-3">
              <DeleteFamilyForm familyName={family.name} />
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-foreground/70">
              Leave {family.name}. Your login is removed and any calendar events synced from
              your Google account are taken down; events you added manually stay on the family
              calendar.
            </p>
            <div className="mt-3">
              <LeaveFamilyButton />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
