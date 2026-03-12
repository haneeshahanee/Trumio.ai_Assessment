import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

export interface EmployeeData {
  firstName:   string;
  middleName?: string;
  lastName:    string;
}

export class AddEmployeePage extends BasePage {
  readonly firstNameInput:  Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput:   Locator;
  readonly saveButton:      Locator;
  readonly cancelButton:    Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput  = page.locator('input[name="firstName"]');
    this.middleNameInput = page.locator('input[name="middleName"]');
    this.lastNameInput   = page.locator('input[name="lastName"]');
    this.saveButton      = page.locator('button[type="submit"]');
    this.cancelButton    = page.locator('button[type="button"]').filter({ hasText: 'Cancel' });
  }

  async goto(): Promise<void> {
    await this.navigateTo('/web/index.php/pim/addEmployee');
    await this.waitForElement(this.firstNameInput);
    logger.info('Add Employee page loaded');
  }

  async fillEmployeeDetails(data: EmployeeData): Promise<void> {
    logger.step(`Filling employee: ${data.firstName} ${data.lastName}`);
    await this.fillInput(this.firstNameInput, data.firstName, 'First Name');
    if (data.middleName) {
      await this.fillInput(this.middleNameInput, data.middleName, 'Middle Name');
    }
    await this.fillInput(this.lastNameInput, data.lastName, 'Last Name');
  }

  async saveEmployee(): Promise<void> {
    logger.step('Saving employee');
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.click();
    await this.waitForSpinnerToDisappear();
    await this.page.waitForURL('**/pim/viewPersonalDetails**', { timeout: 30000 });
    logger.info('Employee saved — on personal details page');
  }

  async getAllValidationErrors(): Promise<string[]> {
    const errorSpans = this.page.locator(
      'span.oxd-input-field-error-message, .oxd-input-group .oxd-text--span'
    );
    const count = await errorSpans.count();
    const msgs: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = await errorSpans.nth(i).textContent();
      if (t?.trim()) msgs.push(t.trim());
    }
    return msgs;
  }
}
