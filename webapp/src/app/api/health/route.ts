import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Used by the Dockerfile's HEALTHCHECK (and any external uptime monitor,
// if someone wires one up) to tell "the process is up" apart from "the
// app can actually serve requests" -- a Node process can be listening
// on the port while its only real dependency, Postgres, is unreachable.
// Deliberately unauthenticated, like the .ics feed: a health probe has
// no session to send, and this leaks nothing beyond "the DB answered".
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Health check failed: database unreachable", err);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
