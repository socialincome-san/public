import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('monitoring payout confirmation page matches screenshot', async ({ page }) => {
	await page.goto('/portal/monitoring/payout-confirmation?sortBy=paymentAt&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});
