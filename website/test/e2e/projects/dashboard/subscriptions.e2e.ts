import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('dashboard subscriptions-page matches screenshot', async ({ page }) => {
	await page.goto('/en/int/dashboard/subscriptions');
	await expect(page.getByTestId('subscriptions-dashboard')).toBeVisible();
	await expect(page.getByTestId('upcoming-payments')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('dashboard wire subscription can view QR bill details', async ({ page }) => {
	await page.goto('/en/int/dashboard/subscriptions');
	await expect(page.getByTestId('subscriptions-dashboard')).toBeVisible();

	await page.getByTestId('wire-subscription-view-qr').first().click();

	const dialog = page.getByTestId('wire-subscription-qr-dialog');
	await expect(dialog).toBeVisible();
	await expect(dialog.getByTestId('donation-wizard-qr-code')).toContainText('Social Income');
	await expect(dialog.getByTestId('donation-wizard-qr-code')).toContainText('CH67');
	await expect(dialog.getByTestId('donation-wizard-qr-code')).toContainText('Standing Order');
	await expect(page.getByRole('button', { name: 'Download PDF' })).toBeVisible();
});
