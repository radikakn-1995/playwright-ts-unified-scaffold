import { test, expect } from "../src/fixtures/page.fixture";

test.describe('PIM page', () => {

  test.beforeEach(async ({ page, pimPage }) => {
    // Already logged in through the saved session (tests/auth.setup.ts)
    await page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(pimPage.searchButton).toBeVisible();
  });

  test('Employee list search with dropdown filters', async ({ pimPage }) => {
    await pimPage.selectEmployeeStatus('Full-Time Permanent');
    await pimPage.selecteincludeDropdown('Current Employees Only');
    await pimPage.selectjobtitleDropdown('QA Engineer');
    await pimPage.selectsubunitDropdown('Engineering');
    await pimPage.clickSearchbutton();

    await expect(pimPage.recordsFound).toBeVisible();
  });

  test('Employee list search by employee name', async ({ pimPage }) => {
    // Replace with a name you can see in the PIM employee list right now
    const existingName = 'Peter';

    await pimPage.enterEmployeeName(existingName);
    await pimPage.clickSearchbutton();

    await expect(pimPage.page.locator('.oxd-table-card').first()).toContainText(existingName);
  });
});
