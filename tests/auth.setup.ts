import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { getEnvironment } from '../src/core/config/environment';

setup('log in as admin and save the session', async ({ page }) => {
  const env = getEnvironment();
  const loginPage = new LoginPage(page);

  await loginPage.gotoLogin();
  await loginPage.login(env.adminUsername, env.adminPassword);
  await expect(page).toHaveURL(/dashboard/, { timeout: 45_000 });

  await page.context().storageState({ path: 'playwright/.auth/admin.json' });
});
