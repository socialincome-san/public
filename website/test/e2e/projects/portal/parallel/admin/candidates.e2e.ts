import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });


test('admin candidates page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/candidates');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin candidates with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/candidates?page=1&pageSize=10&search=candidate-10');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin candidates with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/candidates?page=1&pageSize=10&sortBy=dateOfBirth&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin candidates with direct URL pagination matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/candidates?page=2&pageSize=10');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
