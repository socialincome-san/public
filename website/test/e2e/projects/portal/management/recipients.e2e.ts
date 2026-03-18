import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('management recipients page matches screenshot', async ({ page }) => {
	await page.goto('/portal/management/recipients?sortBy=recipient&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
