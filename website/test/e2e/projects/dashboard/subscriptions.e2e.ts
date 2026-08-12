import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('dashboard subscriptions-page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/subscriptions');
	await expect(page.getByTestId('subscriptions-dashboard')).toBeVisible();
	await expect(page.getByTestId('upcoming-payments')).toBeVisible();
	await expectToHaveScreenshot(page);
});
