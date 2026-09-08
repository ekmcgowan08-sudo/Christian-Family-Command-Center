import { defineConfig } from "@playwright/test";
import { BASE_URL, PORT, TEST_DATABASE_URL } from "./e2e/env";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: "/opt/pw-browsers/chromium",
    },
  },
  webServer: [
    {
      command: "node_modules/.bin/maildev --ip 127.0.0.1 --web-ip 127.0.0.1",
      url: "http://127.0.0.1:1080",
      reuseExistingServer: true,
      timeout: 30_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: `npm run dev -- -p ${PORT}`,
      url: BASE_URL,
      reuseExistingServer: false,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        DATABASE_URL: TEST_DATABASE_URL,
        NEXTAUTH_URL: BASE_URL,
        AUTH_SECRET: process.env.AUTH_SECRET || "test-only-secret-do-not-use-in-production",
        SMTP_HOST: "127.0.0.1",
        SMTP_PORT: "1025",
        SMTP_SECURE: "false",
        SMTP_USER: "test",
        SMTP_PASSWORD: "test",
        SMTP_FROM: "Family Dashboard <noreply@example.com>",
      },
    },
  ],
});
