import { ROUTES } from '@/lib/constants/routes';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('dashboard donation certificates page matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.websiteHome}${ROUTES.dashboardDonationCertificates}`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('dashboard donation certificates has downloadable PDF links', async ({ page }) => {
	await page.goto(`${ROUTES.websiteHome}${ROUTES.dashboardDonationCertificates}`);
	await clickDataTableActionItem(page, 'data-table-action-item-generate-donation-certificate');

	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await dialog.locator('button[role="combobox"]').first().click();
	await page.getByRole('option', { name: '2025' }).click();
	await dialog.locator('button[role="combobox"]').nth(1).click();
	await page.getByRole('option', { name: 'EN' }).click();
	await dialog.getByRole('button', { name: 'Generate Certificates' }).click();
	await expect(dialog.getByText('Generated successfully')).toBeVisible();
	await dialog.getByRole('button', { name: 'Close' }).first().click();
	await expect(dialog).not.toBeVisible();

	await page.goto(`${ROUTES.websiteHome}${ROUTES.dashboardDonationCertificates}?page=1&pageSize=10&search=2025`);
	await expect(page.getByRole('cell', { name: '2025' }).first()).toBeVisible();
	const downloadLink = page.getByRole('link', { name: 'Download' }).first();
	await expect(downloadLink).toBeVisible();
	const href = await downloadLink.getAttribute('href');
	expect(href).toBeTruthy();
	expect(href).toContain('http');
});
