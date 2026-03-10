import { expect, test } from '@playwright/test';

test('admin users page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/users');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin users with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/users?page=1&pageSize=10&search=test%40portal.org');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin users with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/users?page=1&pageSize=10&sortBy=role&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
