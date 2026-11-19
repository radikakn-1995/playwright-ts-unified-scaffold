import { test, expect } from "../src/fixtures/page.fixture";

test.describe('Dashboard Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Already logged in through the saved session (tests/auth.setup.ts)
    await page.goto('/web/index.php/dashboard/index');
  });

  test('Click Upgrade button opens the upgrade page in a new tab', async ({ dashboardPage }) => {
    const upgradePage = await dashboardPage.clickUpgrade();
    await expect(upgradePage).toHaveURL(/upgrade-to-advanced/);
  });
});
