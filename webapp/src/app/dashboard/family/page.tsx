import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeMember, revokeInvite } from "@/lib/actions/family";
import { InviteForm } from "./invite-form";

export default async function FamilyPage() {
  const session = await auth();
  if (!session) return null;

  const [members, invites] = await Promise.all([
    prisma.user.findMany({
      where: { familyId: session.user.familyId },
      orderBy: { createdAt: "asc" },
      include: { googleAccount: true },
    }),
    session.user.role === "OWNER"
      ? prisma.invite.findMany({
          where: { familyId: session.user.familyId, usedAt: null },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-green">Family members</h1>
      <p className="mt-1 text-sm text-foreground/70">
        Everyone logs in with their own email and password. Connecting a
        Google account and sharing it with the family is always each
        member&apos;s own choice.
      </p>

      <ul className="mt-6 space-y-2">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-card px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {member.name}{" "}
                {member.id === session.user.id && (
                  <span className="text-xs text-foreground/50">(you)</span>
                )}
              </p>
              <p className="text-sm text-foreground/60">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-cream px-2.5 py-1 text-xs font-medium text-brand-green">
                {member.role === "OWNER" ? "Owner" : "Member"}
              </span>
              <span className="text-xs text-foreground/50">
                {member.googleAccount ? "Google connected" : "No Google account"}
              </span>
              {session.user.role === "OWNER" && member.id !== session.user.id && (
                <form action={removeMember.bind(null, member.id)}>
                  <button
                    type="submit"
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>

      {session.user.role === "OWNER" && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-brand-green">Invite a family member</h2>
          <p className="mt-1 text-sm text-foreground/70">
            Generate a link and send it to them &mdash; they&apos;ll set their own
            password when they sign up.
          </p>
          <div className="mt-3">
            <InviteForm />
          </div>

          {invites.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground/70">Pending invites</h3>
              <ul className="mt-2 space-y-2">
                {invites.map((invite) => (
                  <li
                    key={invite.id}
                    className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-sm"
                  >
                    <span>
                      {invite.email || "Anyone with the link"} &middot; {invite.role} &middot;
                      expires {invite.expiresAt.toLocaleDateString()}
                    </span>
                    <form action={revokeInvite.bind(null, invite.id)}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Revoke
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
