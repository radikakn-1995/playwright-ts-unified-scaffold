import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PIMPage extends BasePage {
  readonly Pimmenu: Locator;
  readonly employeeId: Locator;
  readonly searchButton: Locator;
  readonly recordsFound: Locator;

  constructor(page: Page) {
    super(page);
    this.Pimmenu = page.getByRole('link', { name: 'PIM', exact: true });
    this.employeeId = this.inputByLabel('Employee Id');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.recordsFound = page.locator('span').filter({ hasText: /Records? Found/ });
  }

  async clickPIMMenu(): Promise<void> {
    await this.click(this.Pimmenu);
  }

  async enterEmployeeName(name: string): Promise<void> {
    await this.pickAutocomplete('Employee Name', name);
  }

  async enterEmployeeId(id: string): Promise<void> {
    await this.fill(this.employeeId, id);
  }

  async enterSupervisorName(name: string): Promise<void> {
    await this.pickAutocomplete('Supervisor Name', name);
  }

  async selectEmployeeStatus(status: string): Promise<void> {
    await this.selectByLabel('Employment Status', status);
  }

  async selecteincludeDropdown(option: string): Promise<void> {
    await this.selectByLabel('Include', option);
  }

  async selectjobtitleDropdown(jobTitle: string): Promise<void> {
    await this.selectByLabel('Job Title', jobTitle);
  }

  async selectsubunitDropdown(subunit: string): Promise<void> {
    await this.selectByLabel('Sub Unit', subunit);
  }

  async clickSearchbutton(): Promise<void> {
    await this.click(this.searchButton);
  }
}
