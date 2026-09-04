import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isGoogleConfigured } from "@/lib/google/oauth";
import { disconnectGoogleAccount, setShareCalendar, syncNow } from "@/lib/actions/google";
import { fetchRecentGmail } from "@/lib/google/calendar";

const ERROR_MESSAGES: Record<string, string> = {
  google_not_configured:
    "Google sign-in isn't set up for this app yet. An administrator needs to add Google OAuth credentials (see docs/GOOGLE_SETUP.md).",
  google_state_mismatch: "That connection request expired or was invalid. Please try again.",
  google_missing_refresh_token:
    "Google didn't grant lasting access this time. Please try connecting again.",
  google_connect_failed: "Something went wrong connecting your Google account. Please try again.",
};

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session) return null;
  const { connected, error } = await searchParams;

  const account = await prisma.googleAccount.findUnique({ where: { userId: session.user.id } });
  const googleConfigured = isGoogleConfigured();

  let recentEmails: Awaited<ReturnType<typeof fetchRecentGmail>> = [];
  if (account) {
    try {
      recentEmails = await fetchRecentGmail(session.user.id, 5);
    } catch {
      // Token may need re-authorization; the UI below already offers reconnect.
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-green">Connected accounts</h1>
      <p className="mt-1 text-sm text-foreground/70">
        This is your own connection &mdash; nobody else in the family can see
        or use it unless you choose to share your calendar below.
      </p>

      {connected && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          Google account connected.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {ERROR_MESSAGES[error] ?? "Something went wrong."}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-brand-border bg-brand-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Google (Calendar &amp; Gmail)</h2>
            <p className="text-sm text-foreground/60">
              {account ? `Connected as ${account.googleEmail}` : "Not connected"}
            </p>
          </div>

          {!account ? (
            <a
              href="/api/google/connect"
              className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                googleConfigured
                  ? "bg-brand-green hover:bg-brand-green-light"
                  : "pointer-events-none bg-gray-300"
              }`}
            >
              Connect Google
            </a>
          ) : (
            <form action={disconnectGoogleAccount}>
              <button
                type="submit"
                className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Disconnect
              </button>
            </form>
          )}
        </div>

        {account && (
          <div className="mt-4 space-y-3 border-t border-brand-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Share this calendar with the family</p>
                <p className="text-xs text-foreground/60">
                  When on, your events sync into the shared family calendar and feed.
                </p>
              </div>
              <form action={setShareCalendar.bind(null, !account.shareCalendar)}>
                <button
                  type="submit"
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    account.shareCalendar
                      ? "bg-brand-green text-white hover:bg-brand-green-light"
                      : "border border-brand-border text-foreground/70 hover:border-brand-green"
                  }`}
                >
                  {account.shareCalendar ? "Sharing" : "Not sharing"}
                </button>
              </form>
            </div>

            {account.shareCalendar && (
              <div className="flex items-center justify-between text-sm text-foreground/60">
                <span>
                  Last synced:{" "}
                  {account.lastSyncedAt
                    ? account.lastSyncedAt.toLocaleString()
                    : "never yet"}
                </span>
                <form action={syncNow}>
                  <button type="submit" className="font-medium text-brand-gold hover:underline">
                    Sync now
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {account && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-brand-green">Recent email</h2>
          <p className="mt-1 text-sm text-foreground/70">
            Read-only preview of your inbox &mdash; only visible to you.
          </p>
          {recentEmails.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/60">
              No recent messages, or Google access needs to be reconnected.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recentEmails.map((email) => (
                <li
                  key={email.id}
                  className="rounded-xl border border-brand-border bg-brand-card px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-xs text-foreground/50">{email.date}</p>
                  </div>
                  <p className="text-xs text-foreground/60">{email.from}</p>
                  <p className="mt-1 truncate text-sm text-foreground/70">{email.snippet}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
