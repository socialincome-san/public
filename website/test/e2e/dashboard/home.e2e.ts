import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
  await seedDatabase();
});

test('dashboard home-page matches screenshot', async ({ page }) => {
  await page.goto('/en/int/dashboard/contributions');
  await expect(page.getByTestId('data-table')).toBeVisible();
  await expect(page).toHaveScreenshot({ fullPage: true });
});
