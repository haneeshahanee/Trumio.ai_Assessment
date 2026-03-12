import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

export class EmployeeListPage extends BasePage {
  readonly employeeNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly employeeTable: Locator;
  readonly tableRows: Locator;
  readonly noRecordsMessage: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.employeeNameInput = page.locator('.oxd-input').nth(0);
    this.employeeIdInput   = page.locator('.oxd-input').nth(1);
    this.employeeTable     = page.locator('.oxd-table');
    this.tableRows         = page.locator('.oxd-table-body .oxd-table-row');
    this.noRecordsMessage  = page.locator('span').filter({ hasText: 'No Records Found' });
    this.pageTitle         = page.locator('.oxd-topbar-header-breadcrumb');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/web/index.php/pim/viewEmployeeList');
    await this.page.waitForSelector('.oxd-table', { timeout: 30000 });
    await this.page.waitForTimeout(500);
    logger.info('Employee list page loaded');
  }

  async searchByEmployeeName(name: string): Promise<void> {
    logger.step(`Searching by employee name: ${name}`);
    const nameInput = this.page.locator('.oxd-autocomplete-text-input input').first();
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.clear();
    await nameInput.fill(name);
    await this.page.waitForTimeout(1500);
    const option = this.page.locator('.oxd-autocomplete-option span').first();
    if (await this.isElementVisible(option, 4000)) {
      await option.click();
      logger.info(`Selected autocomplete option for: ${name}`);
    }
  }

  async searchByEmployeeId(employeeId: string): Promise<void> {
    logger.step(`Searching by employee ID: ${employeeId}`);
    await this.fillInput(this.employeeIdInput, employeeId, 'Employee ID');
  }

  async clickSearch(): Promise<void> {
    logger.step('Clicking Search button');
    const searchBtn = this.page.locator('button[type="submit"]').first();
    await searchBtn.waitFor({ state: 'visible', timeout: 10000 });
    await searchBtn.click();
    await this.waitForSpinnerToDisappear();
    await this.page.waitForTimeout(1500);
  }

  async clickReset(): Promise<void> {
    logger.step('Clicking Reset button');
    const resetBtn = this.page.locator('button[type="reset"]').first();
    await resetBtn.waitFor({ state: 'visible', timeout: 10000 });
    await resetBtn.click();
    await this.waitForSpinnerToDisappear();
  }

  async getEmployeeCount(): Promise<number> {
    await this.waitForSpinnerToDisappear();
    await this.page.waitForTimeout(500);
    const rows = await this.tableRows.count();
    logger.info(`Found ${rows} employee row(s)`);
    return rows;
  }

  async isEmployeeInList(firstName: string, lastName: string): Promise<boolean> {
    await this.waitForSpinnerToDisappear();
    const cell = this.page.locator('.oxd-table-cell')
      .filter({ hasText: `${firstName} ${lastName}` }).first();
    return await this.isElementVisible(cell, 5000);
  }

  async confirmDelete(): Promise<void> {
    logger.step('Confirming delete');
    const confirmBtn = this.page.locator('.oxd-button--label-danger');
    await confirmBtn.waitFor({ state: 'visible', timeout: 8000 });
    await confirmBtn.click();
    await this.waitForSpinnerToDisappear();
    await this.page.waitForTimeout(1000);
  }

  async getEmployeeIdFromRow(rowIndex = 0): Promise<string> {
    const cells = this.tableRows.nth(rowIndex).locator('.oxd-table-cell');
    return (await cells.nth(1).textContent())?.trim() || '';
  }
}
