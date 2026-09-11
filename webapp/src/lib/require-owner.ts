import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Re-checks the caller's role against the database rather than trusting
 * `session.user.role`, which is only as fresh as their JWT -- set once at
 * login and not re-validated on every request. Now that roles can change
 * after signup (see changeMemberRole), that staleness is a real
 * privilege gap, not just a UX one: a demoted owner's existing session
 * would otherwise keep passing owner-only checks until they sign out.
 */
export async function requireOwner(message = "Only a family owner can do this.") {
  const session = await auth();
  if (!session) throw new Error("Not signed in.");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || user.role !== "OWNER") {
    throw new Error(message);
  }

  return session;
}
