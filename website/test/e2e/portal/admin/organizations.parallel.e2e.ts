import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin organizations page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/organizations');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin organizations with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/organizations?page=1&pageSize=10&search=organization-3');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin organizations with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/organizations?page=1&pageSize=10&sortBy=name&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
