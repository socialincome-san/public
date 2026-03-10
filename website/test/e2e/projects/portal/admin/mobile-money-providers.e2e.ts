import { expect, test } from '@playwright/test';

test('admin mobile money providers page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/mobile-money-providers');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin mobile money providers with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/mobile-money-providers?page=1&pageSize=10&search=mobile-money-provider-id-1');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin mobile money providers with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/mobile-money-providers?page=1&pageSize=10&sortBy=name&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
