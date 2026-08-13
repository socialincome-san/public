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

test('dashboard wire subscription can update amount', async ({ page }) => {
	await page.goto('/en/int/dashboard/subscriptions');
	await expect(page.getByTestId('subscriptions-dashboard')).toBeVisible();

	await page.getByTestId('wire-subscription-edit').first().click();
	const amountInput = page.getByTestId('edit-subscription-amount-input');
	await expect(amountInput).toBeVisible();
	await amountInput.fill('75');
	await page.getByRole('button', { name: 'Update Subscription' }).click();
	await expect(page.getByTestId('edit-subscription-success-step')).toBeVisible();
	await page.getByTestId('edit-subscription-done').click();
	await expect(page.getByTestId('wire-subscription-row').first()).toContainText('CHF 75');
});

test('dashboard wire subscription can cancel through retention and reason', async ({ page }) => {
	await page.goto('/en/int/dashboard/subscriptions');
	await expect(page.getByTestId('subscriptions-dashboard')).toBeVisible();

	await page.getByTestId('wire-subscription-edit').first().click();
	await page.getByTestId('edit-subscription-start-cancel').click();
	await expect(page.getByTestId('cancel-retention-step')).toBeVisible();
	await page.getByTestId('cancel-retention-continue').click();
	await page.getByTestId('cancel-reason-other').click();
	await page.getByTestId('cancel-reason-confirm').click();
	await expect(page.getByTestId('cancel-success-step')).toBeVisible();
	await page.getByTestId('edit-subscription-done').click();
	await expect(page.getByTestId('wire-subscription-row')).toHaveCount(0);
});
