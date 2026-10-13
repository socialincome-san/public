import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('assigns recipients from the program pool', async ({ page }) => {
	await page.goto('/portal/programs/program-si-core-sl/recipients');
	await clickDataTableActionItem(page, 'data-table-action-item-add-recipients-from-pool');

	const country = page.getByTestId('pool-country');
	await expect(country).toContainText('Sierra Leone');
	await expect(country.locator('input, select, textarea')).toHaveCount(0);

	await page.getByTestId('radio-card-targeted').click();
	await page.getByTestId('pill-multi-select-female').click();
	await expect(page.getByText('2 of 7 candidates match the current filters')).toBeVisible();
	await page.getByRole('button', { name: 'Continue' }).click();

	const terms = page.getByTestId('pool-terms');
	await expect(page.getByTestId('pool-program-duration')).toHaveText('12 months');
	await expect(page.getByTestId('pool-payout-amount')).toHaveText('600');
	await expect(page.getByTestId('pool-payout-currency')).toHaveText('SLE');
	await expect(page.getByTestId('pool-payout-interval')).toHaveText('Monthly');
	await expect(terms.locator('input, select, textarea')).toHaveCount(0);
	await expect(page.getByTestId('pool-additional-cost')).toHaveText(/7.?200/);

	await page.getByRole('button', { name: 'Add 1 recipient' }).click();
	await expect(page.getByText('Added 1 recipient to this program.')).toBeVisible();

	const assigned = await prisma.recipient.findMany({
		where: { programId: 'program-si-core-sl', id: { startsWith: 'candidate-sl' }, startDate: null },
		select: { id: true },
	});
	expect(assigned).toHaveLength(1);

	await clickDataTableActionItem(page, 'data-table-action-item-add-recipients-from-pool');
	await page.getByTestId('radio-card-targeted').click();
	await page.getByTestId('pill-multi-select-female').click();
	await expect(page.getByText('1 of 6 candidates match the current filters')).toBeVisible();
});
