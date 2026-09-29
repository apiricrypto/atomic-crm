import { defineConfig } from "@playwright/test";

// Isolated FakeRest preview: no Supabase, credentials, or production URL.
export default defineConfig({
  testDir: "./e2e-demo",
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5174",
    locale: "en-US",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
        ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
        : {}),
    },
  },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js --config vite.demo.config.ts --host 127.0.0.1 --port 5174 --strictPort",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: false,
  },
});
