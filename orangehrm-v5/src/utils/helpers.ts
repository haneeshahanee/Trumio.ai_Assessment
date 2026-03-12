import { Page } from '@playwright/test';
import { logger } from './logger';

/**
 * Generate a unique employee ID suffix to avoid conflicts on the shared demo site
 */
export function generateUniqueId(): string {
  return Date.now().toString().slice(-6);
}

/**
 * Generate random employee data for test use
 */
export function generateEmployeeData() {
  const id = generateUniqueId();
  return {
    firstName: `TestFirst${id}`,
    middleName: `Mid`,
    lastName: `TestLast${id}`,
    employeeId: `EMP${id}`,
    username: `testuser${id}`,
    password: `Test@1234`,
  };
}

/**
 * Wait for a toast/alert message and return its text
 */
export async function getToastMessage(page: Page): Promise<string> {
  try {
    const toast = page.locator('.oxd-toast-content, .orangehrm-toast-message, [class*="toast"]').first();
    await toast.waitFor({ state: 'visible', timeout: 10000 });
    const text = await toast.textContent();
    logger.info(`Toast message: ${text}`);
    return text?.trim() || '';
  } catch {
    logger.warn('No toast message found within timeout');
    return '';
  }
}

/**
 * Wait and retry an action with exponential backoff
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await action();
    } catch (error) {
      if (attempt === retries) throw error;
      logger.warn(`Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
      await new Promise(r => setTimeout(r, delayMs * attempt));
    }
  }
  throw new Error('All retry attempts failed');
}

/**
 * Take a named screenshot
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const sanitized = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const screenshotPath = `reports/test-artifacts/screenshots/${sanitized}-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
  logger.info(`Screenshot saved: ${screenshotPath}`);
}

/**
 * Wait for page to fully load
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
    logger.warn('Network idle timeout - continuing anyway');
  });
}

/**
 * Clear and type into an input field reliably
 */
export async function clearAndType(page: Page, selector: string, value: string): Promise<void> {
  const element = page.locator(selector).first();
  await element.waitFor({ state: 'visible' });
  await element.click({ force: true });
  await element.fill('');
  await element.fill(value);
}
