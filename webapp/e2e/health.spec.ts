import { test, expect } from "@playwright/test";
import { BASE_URL } from "./env";

// Only the healthy path is covered here -- the unhealthy (database
// unreachable) path was verified manually by pointing a dev server at a
// stopped Postgres, since this suite's own tests all depend on the same
// Postgres instance staying up throughout the run.
test.describe("health check", () => {
  test("reports ok when the database is reachable", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/health`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
