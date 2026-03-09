import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async () => {
	await seedDatabase();
});

test('management surveys page matches screenshot', async ({ page }) => {
	await page.goto('/portal/management/surveys');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
