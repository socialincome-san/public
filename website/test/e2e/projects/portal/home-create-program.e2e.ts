import { prisma } from '@/lib/database/prisma';
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

test('targeted approach assigns recipients only from the selected local partner', async ({ page }) => {
	await prisma.recipient.update({
		where: { id: 'candidate-sl-7' },
		data: { localPartnerId: 'local-partner-gh-1' },
	});

	await page.goto('/portal');
	await page.getByTestId('create-program-modal-trigger').click();
	await page.getByTestId('radio-card-country-sierra-leone').click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await page.getByTestId('radio-card-targeted').click();
	await page.getByTestId('pill-multi-select-local-partner-sl-1').click();
	await expect(page.getByText('6 of 7 recipients match the selected country and filters')).toBeVisible();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await expect(page.getByText('Great! You initiated a new program')).toBeVisible();
	const createdProgramId = new URL(page.url()).pathname.split('/')[3];
	const assignedRecipients = await prisma.recipient.findMany({
		where: { programId: createdProgramId },
		select: { localPartnerId: true },
	});

	expect(assignedRecipients).toHaveLength(6);
	expect(assignedRecipients.every(({ localPartnerId }) => localPartnerId === 'local-partner-sl-1')).toBe(true);
});
