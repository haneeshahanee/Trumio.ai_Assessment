import { test, expect } from '@playwright/test';

// ──────────────────────────────────────────────
// UI Tests — Swagger Petstore UI
// Uses the Swagger UI at https://petstore.swagger.io
// ──────────────────────────────────────────────

const SWAGGER_UI_URL = 'https://petstore.swagger.io';

test.describe('Swagger UI — Smoke Tests', () => {
  test('✅ should load the Swagger Petstore UI', async ({ page }) => {
    await page.goto(SWAGGER_UI_URL);
    await expect(page).toHaveTitle(/Swagger UI/i);

    // Swagger banner
    const title = page.locator('.title');
    await expect(title).toContainText('Petstore');
  });

  test('✅ should display the three API tag sections', async ({ page }) => {
    await page.goto(SWAGGER_UI_URL);

    // Wait for swagger to render
    await page.waitForSelector('.opblock-tag', { timeout: 15000 });

    const tags = page.locator('.opblock-tag');
    const count = await tags.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Verify pet, store, user sections
    const tagNames = await tags.allInnerTexts();
    const lowerTags = tagNames.map((t) => t.toLowerCase());
    expect(lowerTags.some((t) => t.includes('pet'))).toBeTruthy();
    expect(lowerTags.some((t) => t.includes('store'))).toBeTruthy();
    expect(lowerTags.some((t) => t.includes('user'))).toBeTruthy();
  });

  test('✅ should expand the pet section and list endpoints', async ({
    page,
  }) => {
    await page.goto(SWAGGER_UI_URL);
    await page.waitForSelector('.opblock-tag', { timeout: 15000 });

    // Click "pet" tag to expand
    const petTag = page.locator('.opblock-tag').filter({ hasText: /^pet/i }).first();
    await petTag.click();
    await page.waitForTimeout(1000);

    // Expect at least one operation block to appear
    const ops = page.locator('.opblock');
    const opCount = await ops.count();
    expect(opCount).toBeGreaterThan(0);
  });

  test('✅ should display GET /pet/findByStatus endpoint', async ({ page }) => {
    await page.goto(SWAGGER_UI_URL);
    await page.waitForSelector('.opblock-tag', { timeout: 15000 });

    // The Swagger UI may render the pet section already expanded OR collapsed.
    // Check current state by looking for any visible .opblock first.
    const existingBlocks = await page.locator('.opblock').count();

    if (existingBlocks === 0) {
      // Section is collapsed — click to expand
      const petTag = page
        .locator('.opblock-tag')
        .filter({ hasText: /^pet/i })
        .first();
      await petTag.click();
      await page.waitForSelector('.opblock', { timeout: 10000 });
    }

    // Wait for full render
    await page.waitForTimeout(1500);

    // The path text lives in a <span> inside .opblock-summary-path.
    // Use page.getByText with exact=false as the most reliable approach.
    const findByStatusText = page.getByText('/pet/findByStatus', { exact: false });
    await expect(findByStatusText.first()).toBeVisible({ timeout: 10000 });
  });

  test('✅ should display server URL and version info', async ({ page }) => {
    await page.goto(SWAGGER_UI_URL);

    // Server info section
    const info = page.locator('.swagger-ui .info');
    await expect(info).toBeVisible();

    // Use .first() to avoid strict mode violation — Swagger renders two
    // .version elements (API version + spec version e.g. "OAS 2.0")
    const version = page.locator('.swagger-ui .info .version').first();
    await expect(version).toBeVisible();
    await expect(version).toContainText('1.0.7');
  });
});