import { ROUTES } from '@/lib/constants/routes';
import { expect, test } from '@playwright/test';

test('admin organizations page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalAdminOrganizations);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin organizations with direct URL search matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.portalAdminOrganizations}?page=1&pageSize=10&search=organization-3`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin organizations with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.portalAdminOrganizations}?page=1&pageSize=10&sortBy=name&sortDirection=asc`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
