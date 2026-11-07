import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('management recipients page matches screenshot', async ({ page }) => {
	await page.goto('/portal/management/recipients?sortBy=recipient&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('recipient column headers sort the table directly', async ({ page }) => {
	await page.goto('/portal/management/recipients');
	await expect(page.getByTestId('data-table')).toBeVisible();

	const recipientHeader = page.getByTestId('data-table-sort-header-recipient');
	await recipientHeader.click();
	await expect(page).toHaveURL(/sortBy=recipient&sortDirection=asc/);

	await recipientHeader.click();
	await expect(page).toHaveURL(/sortBy=recipient&sortDirection=desc/);
});
