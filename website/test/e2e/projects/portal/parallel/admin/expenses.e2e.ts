import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('admin expenses page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/expenses');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin expenses with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/expenses?page=1&pageSize=10&search=expense-2');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin expenses with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/expenses?page=1&pageSize=10&sortBy=amountChf&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
