import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('create new program', async ({ page }) => {
	await page.goto('/portal');

	await page.getByTestId('create-program-modal-trigger').click();

	await page.getByTestId('radio-card-country-sierra-leone').click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await page.getByTestId('radio-card-targeted').click();
	await page.getByTestId('pill-multi-select-focus-poverty').click();
	await page.getByTestId('pill-multi-select-focus-health').click();
	await page.getByTestId('pill-multi-select-female').click();
	await expect(page.getByText('2 of 7 recipients match the selected country and filters')).toBeVisible();
	await page.getByRole('button', { name: 'Continue' }).click();

	await page.getByTestId('recipients-slider').getByRole('slider').click();
	const payoutAmount = page.getByTestId('payout-per-interval-amount');
	await expect(payoutAmount).toContainText('SLE');
	await expect(payoutAmount).toContainText('CHF');
	await page.getByTestId('recipients-slider').getByRole('slider').press('ArrowLeft');
	await page.getByTestId('customize-payouts-switch').click();
	await expect(payoutAmount).toContainText('SLE');
	await expect(payoutAmount).toContainText('CHF');
	await page.getByTestId('program-duration-slider').getByRole('slider').click();
	await page.getByTestId('program-duration-slider').getByRole('slider').press('ArrowRight');
	await page.getByTestId('payout-per-interval-slider').getByRole('slider').click();
	await page.getByTestId('payout-per-interval-slider').getByRole('slider').press('ArrowRight');
	await page.getByTestId('payout-per-interval-slider').getByRole('slider').press('ArrowRight');
	await expect(page.getByTestId('total-budget')).toHaveText('928');
	await expect(page.getByTestId('monthly-cost')).toHaveText('25');

	await page.getByRole('button', { name: 'Continue' }).click();
	await expect(page.getByText('Great! You initiated a new program')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Almost there' })).not.toBeVisible();
});
