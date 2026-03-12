import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

export class LoginPage extends BasePage {
  // Locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loginLogo: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.oxd-alert-content-text');
    // OrangeHRM renders validation errors as siblings after the input wrapper
    this.usernameError = page.locator('.oxd-input-group').filter({ has: page.locator('input[name="username"]') }).locator('.oxd-text--span');
    this.passwordError = page.locator('.oxd-input-group').filter({ has: page.locator('input[name="password"]') }).locator('.oxd-text--span');
    this.forgotPasswordLink = page.locator('.orangehrm-login-forgot');
    this.loginLogo = page.locator('.orangehrm-login-branding img');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/web/index.php/auth/login');
    await this.waitForElement(this.usernameInput);
    logger.info('Login page loaded');
  }

  async login(username: string, password: string): Promise<void> {
    logger.step(`Logging in as: ${username}`);
    await this.fillInput(this.usernameInput, username, 'username');
    await this.fillInput(this.passwordInput, password, 'password');
    await this.clickElement(this.loginButton, 'Login button');
  }

  async loginAndWaitForDashboard(username: string, password: string): Promise<void> {
    await this.login(username, password);
    await this.page.waitForURL('**/dashboard/index', { timeout: 20000 });
    logger.info('Successfully navigated to dashboard');
  }

  async getErrorMessage(): Promise<string> {
    return await this.getElementText(this.errorMessage);
  }

  async getUsernameFieldError(): Promise<string> {
    // Try multiple selector strategies OrangeHRM uses
    const selectors = [
      '.oxd-input-group:has(input[name="username"]) .oxd-text--span',
      '.oxd-input-group:has(input[name="username"]) span.oxd-input-field-error-message',
      '.oxd-form-row:first-child .oxd-input-field-error-message',
      'span.oxd-text.oxd-text--span.oxd-input-field-error-message',
    ];
    for (const sel of selectors) {
      try {
        const el = this.page.locator(sel).first();
        await el.waitFor({ state: 'visible', timeout: 8000 });
        const text = (await el.textContent())?.trim() || '';
        if (text) return text;
      } catch { /* try next */ }
    }
    return '';
  }

  async getPasswordFieldError(): Promise<string> {
    const selectors = [
      '.oxd-input-group:has(input[name="password"]) .oxd-text--span',
      '.oxd-input-group:has(input[name="password"]) span.oxd-input-field-error-message',
      '.oxd-form-row:last-child .oxd-input-field-error-message',
    ];
    for (const sel of selectors) {
      try {
        const el = this.page.locator(sel).first();
        await el.waitFor({ state: 'visible', timeout: 8000 });
        const text = (await el.textContent())?.trim() || '';
        if (text) return text;
      } catch { /* try next */ }
    }
    return '';
  }

  async isLoginPageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.loginButton);
  }

  async clickForgotPassword(): Promise<void> {
    await this.clickElement(this.forgotPasswordLink, 'Forgot Password link');
  }
}
