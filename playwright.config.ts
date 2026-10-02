import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:8080', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && go build -o personal-home-page . && ./personal-home-page',
    url: 'http://127.0.0.1:8080/api/health',
    reuseExistingServer: false,
    timeout: 120000,
    env: { ASTRO_TELEMETRY_DISABLED: '1' },
  },
});
