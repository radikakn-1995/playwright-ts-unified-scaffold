import { defineConfig, devices, ReporterDescription } from '@playwright/test';
import { getEnvironment } from './src/core/config/environment';

const env = getEnvironment();
const authFile = 'playwright/.auth/admin.json';
const isCI = !!process.env.CI;

// ---------- Reporters (Day 4 custom reporters, Day 5 reporting) ----------
const reporters: ReporterDescription[] = [
  ['html', { open: 'never' }],                       // HTML report with traces, screenshots, videos
  ['list'],                                          // readable terminal output
];
if (isCI) {
  reporters.push(['junit', { outputFile: 'test-results/junit.xml' }]);   // for CI dashboards (Jenkins, Azure DevOps)
}
if (process.env.AI_REPORT === 'true') {
  reporters.push(['./src/reporters/ai-failure-reporter.ts']);            // Day 13: AI failure analysis
}
reporters.push(['./src/reporters/eval-summary-reporter.ts']);           // Day 11: AI regression vs baseline

// ---------- UI projects share these settings ----------
const uiProject = { testIgnore: ['**/api/**', '**/ai/**'], dependencies: ['setup'] };

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,                    // whole test
  expect: { timeout: 10_000 },        // each web-first assertion
  fullyParallel: true,                // Day 4: parallel execution
  retries: isCI ? 1 : 0,              // Day 4/5: one retry in CI; a test that passes on retry is reported as "flaky"
  workers: isCI ? 2 : undefined,      // the demo site is shared, so keep CI parallelism low
  reporter: reporters,

  use: {
    baseURL: env.baseUrl,             // Day 4: environment management (.env.qa)
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    // Day 5: debugging evidence
    trace: 'on-first-retry',          // full trace (every step, DOM, network) when a test is retried
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Day 3: log in once, save the session
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // UI tests on three browsers
    { name: 'chromium', ...uiProject, use: { ...devices['Desktop Chrome'], storageState: authFile } },
    { name: 'firefox', ...uiProject, use: { ...devices['Desktop Firefox'], storageState: authFile } },
    { name: 'webkit', ...uiProject, use: { ...devices['Desktop Safari'], storageState: authFile } },

    // Day 4: API tests, no browser
    { name: 'api', testDir: './tests/api', dependencies: ['setup'] },

    // Days 6-13: AI tests. LLM calls are slow; no retries, because passing only on retry is a finding.
        {
      name: 'ai',
      testDir: './tests/ai',
      timeout: 600_000,   // 10 min: a local LLM on a laptop CPU is slow
      retries: 0,
      workers: 1,         // Ollama answers one request at a time, so run AI tests one by one
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
