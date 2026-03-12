import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

export interface PersonalDetails {
  firstName?:     string;
  middleName?:    string;
  lastName?:      string;
  nationality?:   string;
  maritalStatus?: string;
  gender?:        string;
}

export class EmployeePersonalDetailsPage extends BasePage {
  readonly firstNameInput:        Locator;
  readonly middleNameInput:       Locator;
  readonly lastNameInput:         Locator;
  // Click the <label> wrapping the radio — avoids the intercepting <span>
  readonly genderMaleLabel:       Locator;
  readonly genderFemaleLabel:     Locator;
  readonly nationalityDropdown:   Locator;
  readonly maritalStatusDropdown: Locator;
  readonly saveButton:            Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput        = page.locator('input[name="firstName"]');
    this.middleNameInput       = page.locator('input[name="middleName"]');
    this.lastNameInput         = page.locator('input[name="lastName"]');
    // Real DOM: <label><input type="radio" value="1"><span ...></span>Male</label>
    this.genderMaleLabel       = page.locator('.oxd-radio-wrapper label').filter({ hasText: 'Male' });
    this.genderFemaleLabel     = page.locator('.oxd-radio-wrapper label').filter({ hasText: 'Female' });
    this.nationalityDropdown   = page.locator('.oxd-select-text').nth(0);
    this.maritalStatusDropdown = page.locator('.oxd-select-text').nth(1);
    this.saveButton            = page.locator('button[type="submit"]').first();
  }

  async isPersonalDetailsPageLoaded(): Promise<boolean> {
    try {
      await this.firstNameInput.waitFor({ state: 'visible', timeout: 20000 });
      return true;
    } catch {
      return false;
    }
  }

  async editPersonalDetails(details: PersonalDetails): Promise<void> {
    logger.step('Editing personal details');
    if (details.firstName !== undefined) {
      await this.fillInput(this.firstNameInput, details.firstName, 'First Name');
    }
    if (details.middleName !== undefined) {
      await this.fillInput(this.middleNameInput, details.middleName, 'Middle Name');
    }
    if (details.lastName !== undefined) {
      await this.fillInput(this.lastNameInput, details.lastName, 'Last Name');
    }
    if (details.nationality) {
      await this.selectDropdownOption(this.nationalityDropdown, details.nationality);
    }
    if (details.maritalStatus) {
      await this.selectDropdownOption(this.maritalStatusDropdown, details.maritalStatus);
    }
    if (details.gender === 'Male') {
      await this.genderMaleLabel.waitFor({ state: 'visible', timeout: 10000 });
      await this.genderMaleLabel.click();
      logger.info('Clicked Male gender label');
    } else if (details.gender === 'Female') {
      await this.genderFemaleLabel.waitFor({ state: 'visible', timeout: 10000 });
      await this.genderFemaleLabel.click();
      logger.info('Clicked Female gender label');
    }
  }

  async savePersonalDetails(): Promise<void> {
    logger.step('Saving personal details');
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.click();
    await this.waitForSpinnerToDisappear();
    await this.page.waitForTimeout(1500);
  }

  async getFirstNameValue(): Promise<string> {
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 15000 });
    return await this.firstNameInput.inputValue();
  }

  async getLastNameValue(): Promise<string> {
    await this.lastNameInput.waitFor({ state: 'visible', timeout: 15000 });
    return await this.lastNameInput.inputValue();
  }
}
