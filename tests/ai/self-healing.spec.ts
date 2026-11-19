import { test, expect } from '../../src/fixtures';
import { findWithFallback, suggestLocator } from '../../src/ai/healing/selfHealing';

test.use({ storageState: 'playwright/.auth/admin.json' });

// Day 13: self-healing locators and AI locator suggestions
test.describe('Self-healing locators', { tag: '@ai' }, () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/web/index.php/pim/viewEmployeeList');
  });

  test('falls back when the primary locator is broken', async ({ page }) => {
    const search = await findWithFallback(page, 'PIM Search button', [
      page.locator('#search-btn-that-does-not-exist'), // broken on purpose
      page.getByRole('button', { name: 'Search' }),
    ]);
    await search.click();
    await expect(page.locator('span').filter({ hasText: /Records? Found/ })).toBeVisible();
  });

  test('LLM suggests a locator from the accessibility tree', async ({ page, llm }) => {
    const suggestion = await suggestLocator(page, llm, 'the Search button in the Employee Information filter');
    console.log('Suggested locator:', suggestion);

    expect(suggestion).toMatch(/page\.(getBy\w+|locator)\(/);
    
    expect.soft(suggestion, 'prefers getBy* locators').toMatch(/getBy(Role|Label|Placeholder|Text)\(/);
  });
});
