import { Page, Locator } from "@playwright/test";
import { BasePage } from './BasePage';
import { getEnvironment } from '../core/config/environment';

export class LoginPage extends BasePage {
  readonly UsernameInput: Locator;
  readonly PasswordInput: Locator;
  readonly LoginButton: Locator;
  readonly ErrorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.UsernameInput = page.getByPlaceholder('Username');
    this.PasswordInput = page.getByPlaceholder('Password');
    this.LoginButton = page.getByRole('button', { name: 'Login' });
    // "Required" under any field, or the "Invalid credentials" box
    this.ErrorMessage = page
      .locator('.oxd-input-field-error-message, .oxd-alert-content-text')
      .first();
  }

  async gotoLogin(): Promise<void> {
    const environment = getEnvironment();
    await this.goto(`${environment.baseUrl}/web/index.php/auth/login`);
  }

 async login(username: string, password: string): Promise<void> {
  await this.fill(this.UsernameInput, username);
  await this.fill(this.PasswordInput, password);

  await this.LoginButton.click({ timeout: 60_000 });
}

  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.ErrorMessage);
    return await this.getText(this.ErrorMessage);
  }
}
