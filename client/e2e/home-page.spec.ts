import { expect, test } from '@playwright/test';

test.describe('HomePage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test(`has a title`, async ({ page }) => {
    await expect(page).toHaveTitle(/Planero/);
  });

  test('has a welcome message', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Hello, planero!');
  });
});
