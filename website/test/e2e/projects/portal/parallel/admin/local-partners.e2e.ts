import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('admin local partners page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/local-partners');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin local partners with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/local-partners?page=1&pageSize=10&search=local-partner-2');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin local partners with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/local-partners?page=1&pageSize=10&sortBy=name&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
