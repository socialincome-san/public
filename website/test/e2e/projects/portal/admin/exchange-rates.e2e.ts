import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin exchange rates page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates?sortBy=timestamp&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('exchange rates search sets URL and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates?sortBy=timestamp&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-search-button').click();
	await page.getByTestId('data-table-search-input').fill('exchange-rate-historical-1200');
	await expect(page).toHaveURL(/search=exchange-rate-historical-1200/);
	await expect(page.getByTestId('data-table-pagination-range')).toContainText('1-1 of 1');
	await expectToHaveScreenshot(page);
});

test('exchange rates filter sets URL and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates?sortBy=timestamp&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-filters-button').click();
	await page.getByTestId('data-table-filter-currency-trigger').click();
	await page.getByRole('option', { name: 'USD' }).click();

	await expect(page).toHaveURL(/currency=USD/);
	await expectToHaveScreenshot(page);
});

test('exchange rates search and filter combination sets URL and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates?sortBy=timestamp&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-search-button').click();
	await page.getByTestId('data-table-search-input').fill('exchange-rate-historical-12');
	await page.getByTestId('data-table-filters-button').click();
	await page.getByTestId('data-table-filter-currency-trigger').click();
	await page.getByRole('option', { name: 'CHF' }).click();

	await expect(page).toHaveURL(/search=exchange-rate-historical-12/);
	await expect(page).toHaveURL(/currency=CHF/);
	await expectToHaveScreenshot(page);
});

test('exchange rates pagination updates URL and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates?sortBy=timestamp&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-page-size-trigger').click();
	await page.getByRole('option', { name: '100', exact: true }).click();
	await expect(page).toHaveURL(/(?:[?&])pageSize=100(?:&|$)/);

	await expect(page.getByTestId('data-table-pagination-range')).toContainText('1-100 of');
	await expect(page.getByTestId('data-table-pagination-next')).toBeEnabled();

	await Promise.all([page.waitForURL(/(?:[?&])page=2(?:&|$)/), page.getByTestId('data-table-pagination-next').click()]);
	await expect(page.getByTestId('data-table-pagination-range')).toContainText('101-200 of 3005');
	await expectToHaveScreenshot(page);

	await Promise.all([page.waitForURL(/(?:[?&])page=1(?:&|$)/), page.getByTestId('data-table-pagination-previous').click()]);
	await expect(page.getByTestId('data-table-pagination-range')).toContainText('1-100 of');
});

test('exchange rates columns can be hidden and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates?sortBy=timestamp&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	const toolbar = page.getByTestId('data-table-toolbar');

	await expect(page.getByRole('columnheader', { name: 'Rate' })).toBeVisible();
	await toolbar.getByTestId('data-table-columns-button').click();
	await expect(page.getByText('Visible columns')).toBeVisible();
	await page.getByTestId('data-table-column-rate-toggle').click({ force: true });
	await expect(page.getByRole('columnheader', { name: 'Rate' })).toHaveCount(0);
	await expectToHaveScreenshot(page);

	await toolbar.getByTestId('data-table-columns-button').click();
	await expect(page.getByText('Visible columns')).toBeVisible();
	await page.getByTestId('data-table-column-rate-toggle').click({ force: true });
	await expect(page.getByRole('columnheader', { name: 'Rate' })).toBeVisible();
});

test('exchange rates no-result search keeps URL and matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/exchange-rates?sortBy=timestamp&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-search-button').click();
	await page.getByTestId('data-table-search-input').fill('exchange-rate-does-not-exist');
	await expect(page).toHaveURL(/search=exchange-rate-does-not-exist/);
	await expect(page.getByText('No exchange rates found')).toBeVisible();
	await expectToHaveScreenshot(page);
});
