import { test, expect } from "../src/fixtures/page.fixture";
import { createValidLoginScenario, negativeLoginScenarios } from "../src/testdata/login-scenarios-data";

// Login tests must start logged out, so this file ignores the saved session
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Tests', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.gotoLogin();
  });

  test('valid login', { tag: '@smoke' }, async ({ loginPage, page }) => {
    const scenario = createValidLoginScenario();
    await loginPage.login(scenario.username, scenario.password);
    await expect(page).toHaveURL(/dashboard/, { timeout: 45_000 });
  });

  for (const scenario of negativeLoginScenarios) {
    test(`${scenario.name}: shows "${scenario.expectedErrorMessage}"`, { tag: '@negative' }, async ({ loginPage }) => {
      await loginPage.login(scenario.username, scenario.password);
      await expect(loginPage.ErrorMessage).toContainText(scenario.expectedErrorMessage);
    });
  }
});
