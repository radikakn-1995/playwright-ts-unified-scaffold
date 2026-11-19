import { Page, Locator } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async waitForElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.fill(value);
  }

  async click(locator: Locator): Promise<void> {
    // Playwright already waits for visible, stable, enabled and scrolls into view
    await locator.click();
  }

  async getText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return (await locator.textContent())?.trim() ?? '';
  }

  // ---------- Helpers for OrangeHRM form fields ----------

  /** The form field block that contains this label text */
  field(label: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.getByText(label, { exact: true }) });
  }

  /** The text box under a label, e.g. 'Employee Id' */
  inputByLabel(label: string): Locator {
    return this.field(label).locator('input');
  }

  /** OrangeHRM dropdowns: click to open, then click the option */
  async selectByLabel(label: string, option: string): Promise<void> {
    await this.field(label).locator('.oxd-select-text').click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  /** "Type for hints..." fields: type, then click the suggestion */
  async pickAutocomplete(label: string, text: string): Promise<void> {
    await this.inputByLabel(label).fill(text);
    await this.page
      .locator('.oxd-autocomplete-option')
      .filter({ hasText: text })
      .first()
      .click();
  }
}
