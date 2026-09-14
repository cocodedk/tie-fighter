import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 30000,
  use: {
    channel: 'chrome',
    baseURL: 'http://localhost:5174',
    viewport: { width: 960, height: 640 },
    launchOptions: { args: [
      '--enable-features=WebMCP', '--enable-blink-features=WebMCP',
      '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    ] },
  },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://localhost:5174', reuseExistingServer: false,
  },
});
