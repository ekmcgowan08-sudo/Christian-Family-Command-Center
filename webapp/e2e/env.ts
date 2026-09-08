import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Minimal .env loader -- keeps e2e tooling dependency-free, matching the
// rest of the app's "no vendor lock-in, bring your own config" style.
// Doesn't override variables the shell/CI already set.
function loadEnvFile(path: string) {
  let content: string;
  try {
    content = readFileSync(path, "utf-8");
  } catch {
    return; // .env is optional -- CI may set real env vars instead.
  }
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(resolve(__dirname, "..", ".env"));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set (copy .env.example to .env) to run e2e tests.");
}

export const PORT = 3100;
export const BASE_URL = `http://localhost:${PORT}`;

// Runs against a dedicated <dbname>_test database, never the dev database,
// so a test run can freely wipe tables without touching real data.
export const TEST_DATABASE_URL = process.env.DATABASE_URL.replace(
  /\/([^/?]+)(\?|$)/,
  "/$1_test$2"
);

export const MAILDEV_API_URL = "http://127.0.0.1:1080/api/email";
