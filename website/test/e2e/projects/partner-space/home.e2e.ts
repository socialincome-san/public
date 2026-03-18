import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('partner-space home-page matches screenshot', async ({ page }) => {
	await page.goto('/partner-space/recipients?sortBy=recipient&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
