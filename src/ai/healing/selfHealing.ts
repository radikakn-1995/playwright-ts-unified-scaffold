import { Locator, Page, test } from '@playwright/test';
import { LlmClient } from '../llm/llmClient';

/** Tries each locator in order and returns the first one visible on the page */
export async function findWithFallback(page: Page, description: string, candidates: Locator[]): Promise<Locator> {
  for (const [index, candidate] of candidates.entries()) {
    const found = await candidate
      .first()
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true, () => false);
    if (found) {
      if (index > 0) {
        console.warn(`[self-healing] "${description}": primary locator failed, used fallback #${index}. Update the page object.`);
        test.info().annotations.push({ type: 'self-healed', description });
      }
      return candidate;
    }
  }
  throw new Error(`[self-healing] No locator matched "${description}" on ${page.url()}`);
}

/** Asks the LLM to propose a locator from the page's accessibility tree. A human reviews it. */
export async function suggestLocator(page: Page, llm: LlmClient, description: string): Promise<string> {
  const snapshot = await page.locator('body').ariaSnapshot();
  const result = await llm.chat([
    {
      role: 'system',
            content:
        'You write Playwright TypeScript locators. Use ONLY these methods: getByRole, getByLabel, getByPlaceholder, getByText. ' +
        'Do not use CSS or XPath selectors. Reply with one line of code only, starting with page.\n' +
        "Example: page.getByRole('button', { name: 'Save' })",
    },
    { role: 'user', content: `Accessibility snapshot:\n${snapshot.slice(0, 6000)}\n\nElement wanted: ${description}` },
  ]);
  return result.text.trim();
}
