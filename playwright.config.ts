import { defineConfig, devices } from '@playwright/test';
const port = process.env.PLAYWRIGHT_PORT || '8080';
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && go build -o personal-home-page . && ./personal-home-page',
    url: `${baseURL}/api/health`,
    reuseExistingServer: false,
    timeout: 120000,
    env: { ASTRO_TELEMETRY_DISABLED: '1', PORT: port },
  },
});
