import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('dashboard contributions-page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/contributions?sortBy=createdAt&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});
