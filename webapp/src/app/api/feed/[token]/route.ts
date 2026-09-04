import { NextRequest, NextResponse } from "next/server";
import { buildFamilyIcsFeed } from "@/lib/ics";

// Deliberately unauthenticated: this is the whole point of a webcal feed --
// phones and other calendar apps subscribe to it directly by URL, with no
// login step. Security comes from the token being a long, unguessable
// secret (see Family.icsToken), not from a password prompt.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token: rawToken } = await params;
  const token = rawToken.endsWith(".ics") ? rawToken.slice(0, -4) : rawToken;
  const ics = await buildFamilyIcsFeed(token);
  if (ics === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="family-calendar.ics"',
      "Cache-Control": "no-store",
    },
  });
}
