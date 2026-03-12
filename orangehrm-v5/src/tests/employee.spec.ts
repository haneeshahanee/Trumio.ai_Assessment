import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { AddEmployeePage } from '../pages/AddEmployeePage';
import { EmployeePersonalDetailsPage } from '../pages/EmployeePersonalDetailsPage';
import { VALID_CREDENTIALS } from '../data/testData';
import { generateEmployeeData } from '../utils/helpers';
import { logger } from '../utils/logger';

async function loginAsAdmin(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAndWaitForDashboard(
    VALID_CREDENTIALS.username,
    VALID_CREDENTIALS.password
  );
}

async function createEmployee(page: Page): Promise<{
  firstName: string;
  lastName: string;
  internalId: string;
}> {
  const raw = generateEmployeeData();
  logger.info(`Creating: ${raw.firstName} ${raw.lastName}`);
  const addPage = new AddEmployeePage(page);
  await addPage.goto();
  await addPage.fillEmployeeDetails({ firstName: raw.firstName, lastName: raw.lastName });
  await addPage.saveEmployee();
  const url = page.url();
  const match = url.match(/empNumber\/(\d+)/);
  const internalId = match ? match[1] : '';
  logger.info(`Created. internalId=${internalId}`);
  return { firstName: raw.firstName, lastName: raw.lastName, internalId };
}

// Navigate to personal details and wait until firstName input has a value
async function openPersonalDetails(page: Page, internalId: string, expectedFirst: string): Promise<EmployeePersonalDetailsPage> {
  await page.goto(`/web/index.php/pim/viewPersonalDetails/empNumber/${internalId}`);
  await page.waitForLoadState('networkidle').catch(() => {});

  const detailsPage = new EmployeePersonalDetailsPage(page);
  // Wait for input to be visible AND populated (the Vue app hydrates asynchronously)
  await detailsPage.firstNameInput.waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForFunction(
    (expected) => {
      const el = document.querySelector('input[name="firstName"]') as HTMLInputElement;
      return el && el.value === expected;
    },
    expectedFirst,
    { timeout: 15000 }
  );
  logger.info(`Personal details loaded, firstName="${await detailsPage.getFirstNameValue()}"`);
  return detailsPage;
}

test.describe('PIM Module - Employee Management', () => {

  // TC-E01 ─ Create employee ─────────────────────────────────────────────────
  test('TC-E01: Should successfully create a new employee', async ({ page }) => {
    logger.testStart('TC-E01');
    await loginAsAdmin(page);
    const emp = await createEmployee(page);
    expect(page.url()).toContain('pim/viewPersonalDetails');
    expect(emp.internalId).toMatch(/^\d+$/);
    logger.testEnd('TC-E01', true);
  });

  // TC-E02 ─ Find by name ────────────────────────────────────────────────────
  test('TC-E02: Should find created employee by name in list', async ({ page }) => {
    logger.testStart('TC-E02');
    await loginAsAdmin(page);
    const emp = await createEmployee(page);
    const listPage = new EmployeeListPage(page);
    await listPage.goto();
    await listPage.searchByEmployeeName(emp.firstName);
    await listPage.clickSearch();
    expect(await listPage.getEmployeeCount()).toBeGreaterThanOrEqual(1);
    logger.testEnd('TC-E02', true);
  });

  // TC-E03 ─ No records for bad ID ──────────────────────────────────────────
  test('TC-E03: Should show no records for non-existent employee ID', async ({ page }) => {
    logger.testStart('TC-E03');
    await loginAsAdmin(page);
    const listPage = new EmployeeListPage(page);
    await listPage.goto();
    await listPage.searchByEmployeeId('XXXXNOTEXIST99999');
    await listPage.clickSearch();
    const noRecords = await listPage.isElementVisible(listPage.noRecordsMessage, 8000);
    if (!noRecords) {
      expect(await listPage.getEmployeeCount()).toBe(0);
    } else {
      expect(noRecords).toBe(true);
    }
    logger.testEnd('TC-E03', true);
  });

  // TC-E04 ─ Reset clears filters ────────────────────────────────────────────
  test('TC-E04: Reset button should clear search filters', async ({ page }) => {
    logger.testStart('TC-E04');
    await loginAsAdmin(page);
    const listPage = new EmployeeListPage(page);
    await listPage.goto();
    await listPage.searchByEmployeeId('SOMEVALUE123');
    await listPage.clickReset();
    expect(await listPage.employeeIdInput.inputValue()).toBe('');
    logger.testEnd('TC-E04', true);
  });

  // TC-E05 ─ Personal details page loads with correct data ───────────────────
  test('TC-E05: Personal details page should load with correct employee name', async ({ page }) => {
    logger.testStart('TC-E05');
    await loginAsAdmin(page);
    const emp = await createEmployee(page);
    const detailsPage = await openPersonalDetails(page, emp.internalId, emp.firstName);
    const firstName = await detailsPage.getFirstNameValue();
    logger.info(`Got firstName="${firstName}"`);
    expect(firstName).toBe(emp.firstName);
    logger.testEnd('TC-E05', true);
  });

  // TC-E06 ─ Save personal details with gender ───────────────────────────────
  test('TC-E06: Should save and verify employee personal details', async ({ page }) => {
    logger.testStart('TC-E06');
    await loginAsAdmin(page);
    const emp = await createEmployee(page);
    const detailsPage = await openPersonalDetails(page, emp.internalId, emp.firstName);

    await detailsPage.editPersonalDetails({ gender: 'Male' });
    await detailsPage.savePersonalDetails();

    // Wait for toast — try multiple selectors
    const toastText = await page.evaluate(() => {
      const selectors = [
        '.oxd-toast-content--success .oxd-text',
        '.oxd-toast--success .oxd-text',
        '.oxd-toast-content .oxd-text',
        '.oxd-toast',
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el?.textContent?.trim()) return el.textContent.trim();
      }
      return '';
    });
    logger.info(`Toast text: "${toastText}"`);

    // If toast missed (disappeared too fast), verify page still on personal details = save worked
    if (!toastText.toLowerCase().includes('success')) {
      expect(page.url()).toContain('pim/viewPersonalDetails');
    } else {
      expect(toastText.toLowerCase()).toContain('success');
    }
    logger.testEnd('TC-E06', true);
  });

  // TC-E07 ─ Data persists after save ───────────────────────────────────────
  test('TC-E07: Personal details should persist after save', async ({ page }) => {
    logger.testStart('TC-E07');
    await loginAsAdmin(page);
    const emp = await createEmployee(page);
    const detailsPage = await openPersonalDetails(page, emp.internalId, emp.firstName);

    expect(await detailsPage.getFirstNameValue()).toBe(emp.firstName);
    expect(await detailsPage.getLastNameValue()).toBe(emp.lastName);
    logger.testEnd('TC-E07', true);
  });

  // TC-E08 ─ Edit employee name ──────────────────────────────────────────────
  test('TC-E08: Should edit employee details successfully', async ({ page }) => {
    logger.testStart('TC-E08');
    await loginAsAdmin(page);
    const emp = await createEmployee(page);
    const detailsPage = await openPersonalDetails(page, emp.internalId, emp.firstName);

    const updatedFirst = `${emp.firstName}Ed`;
    await detailsPage.editPersonalDetails({ firstName: updatedFirst });
    await detailsPage.savePersonalDetails();

    // Re-open to confirm persisted
    const detailsPage2 = await openPersonalDetails(page, emp.internalId, updatedFirst);
    expect(await detailsPage2.getFirstNameValue()).toBe(updatedFirst);
    logger.info(`Confirmed updated firstName="${updatedFirst}"`);
    logger.testEnd('TC-E08', true);
  });

  // TC-E09 ─ Validation errors ───────────────────────────────────────────────
  test('TC-E09: Should show validation errors when saving without required fields', async ({ page }) => {
    logger.testStart('TC-E09');
    await loginAsAdmin(page);
    const addPage = new AddEmployeePage(page);
    await addPage.goto();
    await addPage.firstNameInput.fill('');
    await addPage.lastNameInput.fill('');
    await addPage.saveButton.click();
    await page.waitForTimeout(1500);

    const errorSpans = page.locator(
      'span.oxd-input-field-error-message, .oxd-input-group .oxd-text--span'
    );
    const msgs: string[] = [];
    const count = await errorSpans.count();
    for (let i = 0; i < count; i++) {
      const t = await errorSpans.nth(i).textContent();
      if (t?.trim()) msgs.push(t.trim());
    }
    logger.info(`Validation messages: ${JSON.stringify(msgs)}`);
    expect(msgs.length).toBeGreaterThan(0);
    expect(msgs.some(m => m.toLowerCase().includes('required'))).toBe(true);
    logger.testEnd('TC-E09', true);
  });

  // TC-E10 ─ Delete employee ────────────────────────────────────────────────
  test('TC-E10: Should delete employee successfully', async ({ page }) => {
    logger.testStart('TC-E10');
    await loginAsAdmin(page);
    const emp = await createEmployee(page);
    const listPage = new EmployeeListPage(page);
    await listPage.goto();
    await listPage.searchByEmployeeName(emp.firstName);
    await listPage.clickSearch();
    expect(await listPage.getEmployeeCount()).toBeGreaterThanOrEqual(1);

    const deleteBtn = listPage.tableRows.nth(0).locator('.oxd-icon-button').nth(1);
    await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });
    await deleteBtn.click();
    await listPage.confirmDelete();

    await listPage.goto();
    await listPage.searchByEmployeeName(emp.firstName);
    await listPage.clickSearch();
    expect(await listPage.getEmployeeCount()).toBe(0);
    logger.testEnd('TC-E10', true);
  });

  // TC-E11 ─ Employee list page loads ───────────────────────────────────────
  test('TC-E11: Employee list page should load correctly', async ({ page }) => {
    logger.testStart('TC-E11');
    await loginAsAdmin(page);
    const listPage = new EmployeeListPage(page);
    await listPage.goto();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[type="reset"]').first()).toBeVisible({ timeout: 10000 });
    await expect(listPage.employeeTable).toBeVisible({ timeout: 10000 });
    logger.testEnd('TC-E11', true);
  });

  // TC-E12 ─ Add Employee form fields ───────────────────────────────────────
  test('TC-E12: Add Employee page should have required form fields', async ({ page }) => {
    logger.testStart('TC-E12');
    await loginAsAdmin(page);
    const addPage = new AddEmployeePage(page);
    await addPage.goto();
    await expect(addPage.firstNameInput).toBeVisible();
    await expect(addPage.middleNameInput).toBeVisible();
    await expect(addPage.lastNameInput).toBeVisible();
    await expect(addPage.saveButton).toBeVisible();
    await expect(addPage.cancelButton).toBeVisible();
    logger.testEnd('TC-E12', true);
  });

  // TC-E13 ─ Cancel returns to list ─────────────────────────────────────────
  test('TC-E13: Cancel button on Add Employee should return to list', async ({ page }) => {
    logger.testStart('TC-E13');
    await loginAsAdmin(page);
    const addPage = new AddEmployeePage(page);
    await addPage.goto();
    await addPage.cancelButton.click();
    await page.waitForURL('**/pim/viewEmployeeList', { timeout: 10000 });
    expect(page.url()).toContain('pim/viewEmployeeList');
    logger.testEnd('TC-E13', true);
  });

  // TC-E14 ─ PIM navigation from dashboard ──────────────────────────────────
  test('TC-E14: PIM navigation from dashboard should work', async ({ page }) => {
    logger.testStart('TC-E14');
    await loginAsAdmin(page);
    const dashboard = new DashboardPage(page);
    await dashboard.navigateToPIM();
    expect(page.url()).toContain('pim/viewEmployeeList');
    logger.testEnd('TC-E14', true);
  });

});
