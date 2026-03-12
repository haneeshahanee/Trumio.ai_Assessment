import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../utils/logger';
import { waitForPageLoad } from '../utils/helpers';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(path: string): Promise<void> {
    logger.step(`Navigating to: ${path}`);
    await this.page.goto(path);
    await waitForPageLoad(this.page);
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForElement(locator: Locator, timeout = 15000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async clickElement(locator: Locator, description?: string): Promise<void> {
    if (description) logger.step(`Clicking: ${description}`);
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.click();
  }

  async fillInput(locator: Locator, value: string, description?: string): Promise<void> {
    if (description) logger.step(`Filling ${description}: ${value}`);
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.clear();
    await locator.fill(value);
  }

  async getElementText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    return (await locator.textContent())?.trim() || '';
  }

  async isElementVisible(locator: Locator, timeout = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async waitForToast(expectedText?: string): Promise<string> {
    const toastSelector = '.oxd-toast-content--success, .oxd-toast-content--error, .oxd-toast-content';
    try {
      const toast = this.page.locator(toastSelector).first();
      await toast.waitFor({ state: 'visible', timeout: 10000 });
      const text = (await toast.textContent())?.trim() || '';
      logger.info(`Toast: ${text}`);
      if (expectedText) {
        expect(text).toContain(expectedText);
      }
      return text;
    } catch {
      return '';
    }
  }

  async selectDropdownOption(dropdownLocator: Locator, optionText: string): Promise<void> {
    logger.step(`Selecting dropdown option: ${optionText}`);
    await dropdownLocator.click();
    const option = this.page.locator('.oxd-select-option span, .oxd-autocomplete-option span').filter({ hasText: optionText }).first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
  }

  async waitForSpinnerToDisappear(): Promise<void> {
    const spinner = this.page.locator('.oxd-loading-spinner');
    try {
      await spinner.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // spinner may not be present
    }
  }
}
