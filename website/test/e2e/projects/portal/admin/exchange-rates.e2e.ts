import { expect, test } from '@playwright/test';

test('admin exchange rates page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('exchange rates search sets URL and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-search-button').click();
	await page.getByTestId('data-table-search-input').fill('exchange-rate-historical-1200');
	await expect(page).toHaveURL(/search=exchange-rate-historical-1200/);
	await expect(page.getByTestId('data-table-pagination-range')).toContainText('1-1 of 1');
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('exchange rates filter sets URL and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-filters-button').click();
	await page.getByTestId('data-table-filter-currency-trigger').click();
	await page.getByRole('option', { name: 'USD' }).click();

	await expect(page).toHaveURL(/currency=USD/);
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('exchange rates search and filter combination sets URL and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-search-button').click();
	await page.getByTestId('data-table-search-input').fill('exchange-rate-historical-12');
	await page.getByTestId('data-table-filters-button').click();
	await page.getByTestId('data-table-filter-currency-trigger').click();
	await page.getByRole('option', { name: 'CHF' }).click();

	await expect(page).toHaveURL(/search=exchange-rate-historical-12/);
	await expect(page).toHaveURL(/currency=CHF/);
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('exchange rates pagination updates URL and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-page-size-trigger').click();
	await page.getByRole('option', { name: '100', exact: true }).click();
	await expect(page).toHaveURL(/(?:[?&])pageSize=100(?:&|$)/);

	await expect(page.getByTestId('data-table-pagination-range')).toContainText('1-100 of');
	await expect(page.getByTestId('data-table-pagination-next')).toBeEnabled();

	await Promise.all([page.waitForURL(/(?:[?&])page=2(?:&|$)/), page.getByTestId('data-table-pagination-next').click()]);
	await expect(page.getByTestId('data-table-pagination-range')).toContainText('101-200 of 3005');
	await expect(page).toHaveScreenshot({ fullPage: true });

	await Promise.all([
		page.waitForURL(/(?:[?&])page=1(?:&|$)/),
		page.getByTestId('data-table-pagination-previous').click(),
	]);
	await expect(page.getByTestId('data-table-pagination-range')).toContainText('1-100 of');
});

test('exchange rates columns can be hidden and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates');
	await expect(page.getByTestId('data-table')).toBeVisible();
	const toolbar = page.getByTestId('data-table-toolbar');

	await expect(page.getByRole('columnheader', { name: 'Rate' })).toBeVisible();
	await toolbar.getByTestId('data-table-columns-button').click();
	await expect(page.getByText('Visible columns')).toBeVisible();
	await page.getByTestId('data-table-column-rate-toggle').click({ force: true });
	await expect(page.getByRole('columnheader', { name: 'Rate' })).toHaveCount(0);
	await expect(page).toHaveScreenshot({ fullPage: true });

	await toolbar.getByTestId('data-table-columns-button').click();
	await expect(page.getByText('Visible columns')).toBeVisible();
	await page.getByTestId('data-table-column-rate-toggle').click({ force: true });
	await expect(page.getByRole('columnheader', { name: 'Rate' })).toBeVisible();
});

test('exchange rates no-result search keeps URL and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-search-button').click();
	await page.getByTestId('data-table-search-input').fill('exchange-rate-does-not-exist');
	await expect(page).toHaveURL(/search=exchange-rate-does-not-exist/);
	await expect(page.getByText('No exchange rates found')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});
