import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { VALID_CREDENTIALS, INVALID_CREDENTIALS, ERROR_MESSAGES } from '../data/testData';
import { logger } from '../utils/logger';

test.describe('Login and Logout Workflows', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  // ─── POSITIVE TESTS ───────────────────────────────────────────────

  test('TC-L01: Login page should display all required elements', async ({ page }) => {
    logger.testStart('TC-L01: Login page elements');

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.loginLogo).toBeVisible();

    const buttonText = await loginPage.loginButton.textContent();
    expect(buttonText?.trim()).toBe('Login');

    logger.testEnd('TC-L01', true);
  });

  test('TC-L02: Should successfully login with valid credentials', async ({ page }) => {
    logger.testStart('TC-L02: Valid login');

    await loginPage.loginAndWaitForDashboard(
      VALID_CREDENTIALS.username,
      VALID_CREDENTIALS.password
    );

    const isDashboardLoaded = await dashboardPage.isDashboardLoaded();
    expect(isDashboardLoaded).toBe(true);

    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('/dashboard/index');

    logger.testEnd('TC-L02', true);
  });

  test('TC-L03: Should display logged in user name after login', async ({ page }) => {
    logger.testStart('TC-L03: User name display');

    await loginPage.loginAndWaitForDashboard(
      VALID_CREDENTIALS.username,
      VALID_CREDENTIALS.password
    );

    const userName = await dashboardPage.getLoggedInUserName();
    expect(userName.length).toBeGreaterThan(0);
    logger.info(`Logged in user: ${userName}`);

    logger.testEnd('TC-L03', true);
  });

  test('TC-L04: Should successfully logout after login', async ({ page }) => {
    logger.testStart('TC-L04: Logout');

    await loginPage.loginAndWaitForDashboard(
      VALID_CREDENTIALS.username,
      VALID_CREDENTIALS.password
    );

    await dashboardPage.logout();

    const isLoginVisible = await loginPage.isLoginPageVisible();
    expect(isLoginVisible).toBe(true);

    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('/auth/login');

    logger.testEnd('TC-L04', true);
  });

  test('TC-L05: Should redirect to login page when accessing protected URL after logout', async ({ page }) => {
    logger.testStart('TC-L05: Protected URL redirect after logout');

    await loginPage.loginAndWaitForDashboard(
      VALID_CREDENTIALS.username,
      VALID_CREDENTIALS.password
    );
    await dashboardPage.logout();

    await page.goto('/web/index.php/pim/viewEmployeeList');
    await page.waitForURL('**/auth/login', { timeout: 10000 });

    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('/auth/login');

    logger.testEnd('TC-L05', true);
  });

  // ─── NEGATIVE TESTS ───────────────────────────────────────────────

  test('TC-L06: Should show error for invalid password', async ({ page }) => {
    logger.testStart('TC-L06: Invalid password');

    await loginPage.login(
      INVALID_CREDENTIALS.wrongPassword.username,
      INVALID_CREDENTIALS.wrongPassword.password
    );

    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
    const errorText = await loginPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('invalid credentials');

    logger.info(`Error message: ${errorText}`);
    logger.testEnd('TC-L06', true);
  });

  test('TC-L07: Should show error for invalid username', async ({ page }) => {
    logger.testStart('TC-L07: Invalid username');

    await loginPage.login(
      INVALID_CREDENTIALS.wrongUsername.username,
      INVALID_CREDENTIALS.wrongUsername.password
    );

    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
    const errorText = await loginPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('invalid credentials');

    logger.testEnd('TC-L07', true);
  });

  test('TC-L08: Should show validation error for empty username', async ({ page }) => {
    logger.testStart('TC-L08: Empty username validation');

    await loginPage.login('', 'somepassword');

    // Wait a moment for validation to render
    await page.waitForTimeout(1000);

    // Try field-level error first, fall back to any visible error span
    let errorText = await loginPage.getUsernameFieldError();
    if (!errorText) {
      const anyError = page.locator('span.oxd-input-field-error-message, .oxd-text--span').first();
      errorText = await anyError.textContent().catch(() => '') || '';
    }

    logger.info(`Validation error: "${errorText}"`);
    expect(errorText.trim()).toBeTruthy();
    expect(errorText.toLowerCase()).toContain('required');
    logger.testEnd('TC-L08', true);
  });

  test('TC-L09: Should show validation error for empty password', async ({ page }) => {
    logger.testStart('TC-L09: Empty password validation');

    await loginPage.login('Admin', '');
    await page.waitForTimeout(1000);

    let errorText = await loginPage.getPasswordFieldError();
    if (!errorText) {
      const anyError = page.locator('span.oxd-input-field-error-message, .oxd-text--span').first();
      errorText = await anyError.textContent().catch(() => '') || '';
    }

    logger.info(`Validation error: "${errorText}"`);
    expect(errorText.trim()).toBeTruthy();
    expect(errorText.toLowerCase()).toContain('required');
    logger.testEnd('TC-L09', true);
  });

  test('TC-L10: Should show validation errors when both fields are empty', async ({ page }) => {
    logger.testStart('TC-L10: Both fields empty');

    await loginPage.login('', '');
    await page.waitForTimeout(1000);

    // Collect all visible error spans
    const allErrors = page.locator('span.oxd-input-field-error-message, .oxd-text--span');
    const count = await allErrors.count();
    logger.info(`Total error spans visible: ${count}`);

    const usernameError = await loginPage.getUsernameFieldError();
    const passwordError = await loginPage.getPasswordFieldError();

    logger.info(`Username error: "${usernameError}", Password error: "${passwordError}"`);

    // At least one Required error must appear
    const combined = (usernameError + ' ' + passwordError).toLowerCase();
    expect(combined).toContain('required');

    logger.testEnd('TC-L10', true);
  });

  test('TC-L11: Should navigate to Forgot Password page', async ({ page }) => {
    logger.testStart('TC-L11: Forgot Password navigation');

    await loginPage.clickForgotPassword();
    await page.waitForURL('**/requestPasswordResetCode', { timeout: 10000 });

    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('requestPasswordResetCode');

    logger.testEnd('TC-L11', true);
  });

  test('TC-L12: Password field should mask input', async ({ page }) => {
    logger.testStart('TC-L12: Password masking');

    const passwordType = await loginPage.passwordInput.getAttribute('type');
    expect(passwordType).toBe('password');

    logger.testEnd('TC-L12', true);
  });
});
