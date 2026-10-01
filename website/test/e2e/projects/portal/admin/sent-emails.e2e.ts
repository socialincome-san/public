import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin sent emails page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/sent-mails');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('admin sent emails can be searched', async ({ page }) => {
	await page.goto('/portal/admin/sent-mails?page=1&pageSize=10&search=external@example.com');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page.getByText('Welcome email')).toBeVisible();
	await expect(page.getByText('Monthly summary - August 2026')).not.toBeVisible();
});

test('admin sent emails can be sorted by sent date', async ({ page }) => {
	await page.goto('/portal/admin/sent-mails?page=1&pageSize=10&sortBy=sentAt&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page.getByText('Welcome email')).toBeVisible();
});
