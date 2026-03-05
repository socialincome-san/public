import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin exchange rates page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
