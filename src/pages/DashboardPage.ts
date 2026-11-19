import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  readonly upgradeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.upgradeButton = page.getByRole('link', { name: 'Upgrade' });
  }

  async clickUpgrade(): Promise<Page> {
    const newPagePromise = this.page.waitForEvent('popup');   // 1. listen
    await this.click(this.upgradeButton);                     // 2. act
    const newPage = await newPagePromise;                     // 3. await

    await newPage.waitForLoadState('domcontentloaded');

    // The cookie banner is on the NEW tab. Click it if it appears within 3 seconds.
    const allowAll = newPage.getByRole('link', { name: 'Allow all', exact: true });
    await allowAll.click({ timeout: 3000 }).catch(() => {});

    return newPage;
  }
}
