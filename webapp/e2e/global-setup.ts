import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { TEST_DATABASE_URL } from "./env";

/**
 * Prepares the dedicated e2e test database: creates it if missing, applies
 * migrations, then wipes all app tables so every test run starts clean.
 * Never touches the dev database -- TEST_DATABASE_URL always points at a
 * separate "<name>_test" database derived from DATABASE_URL.
 */
export default async function globalSetup() {
  const url = new URL(TEST_DATABASE_URL);
  const dbName = url.pathname.replace(/^\//, "");
  const adminUrl = new URL(TEST_DATABASE_URL);
  adminUrl.pathname = "/postgres";

  const admin = new PrismaClient({ datasources: { db: { url: adminUrl.toString() } } });
  try {
    const exists = await admin.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) as exists`,
      dbName
    );
    if (!exists[0]?.exists) {
      await admin.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await admin.$disconnect();
  }

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });

  const db = new PrismaClient({ datasources: { db: { url: TEST_DATABASE_URL } } });
  try {
    const tables: { tablename: string }[] = await db.$queryRawUnsafe(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma%'`
    );
    if (tables.length > 0) {
      const names = tables.map((t) => `"${t.tablename}"`).join(", ");
      await db.$executeRawUnsafe(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);
    }
  } finally {
    await db.$disconnect();
  }
}
