import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('partner-space candidates page matches screenshot', async ({ page }) => {
	await page.goto('/partner-space/candidates?sortBy=candidate&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveScreenshot({ fullPage: true });
});
