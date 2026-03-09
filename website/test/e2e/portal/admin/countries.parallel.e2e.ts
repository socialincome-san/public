import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin countries page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/countries');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin countries with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/countries?page=1&pageSize=10&search=country-liberia');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin countries with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/countries?page=1&pageSize=10&sortBy=isoCode&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
