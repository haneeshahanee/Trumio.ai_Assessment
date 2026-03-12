import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
  ],

  use: {
    baseURL: 'https://petstore.swagger.io/v2',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'API Tests',
      testDir: './tests/api',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'UI Tests',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],
});
