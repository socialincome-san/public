import { PayoutStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, Page, test } from '@playwright/test';
import { clickDataTableActionItem, selectOptionByTestId } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

const selectAnyPaymentDate = async (page: Page) => {
	await page.getByTestId('form-item-paymentAt').locator('button').click();
	await page.locator('[role="grid"] button:not([disabled])').first().click();
};

const savePayoutAndWait = async (page: Page) => {
	await page.getByRole('button', { name: 'Save' }).click();
	await Promise.race([
		page.getByTestId('dynamic-form').waitFor({ state: 'detached' }),
		page.getByText('Error saving payout:').waitFor({ state: 'visible' }),
	]);
	if (await page.getByTestId('dynamic-form').isVisible()) {
		const errorText = await page.getByText('Error saving payout:').first().textContent();
		throw new Error(`Payout save failed: ${errorText ?? 'Unknown error'}`);
	}
};

test('add manual payout', async ({ page }) => {
	const unique = Date.now();
	const amount = 77.7;
	const phoneNumber = `+23277${String(unique).slice(-6)}`;

	await page.goto('/portal/delivery/make-payouts');
	await clickDataTableActionItem(page, 'data-table-action-item-add-manually');
	await selectOptionByTestId(page, 'recipientId');
	await page.getByTestId('form-item-amount').locator('input').fill(`${amount}`);
	await selectOptionByTestId(page, 'currency', 'USD');
	await page.getByTestId('form-item-phoneNumber').locator('input').fill(phoneNumber);
	await selectAnyPaymentDate(page);
	await selectOptionByTestId(page, 'status', 'confirmed');
	await savePayoutAndWait(page);

	const created = await prisma.payout.findFirst({
		where: {
			amount,
			currency: 'USD',
			phoneNumber,
			status: PayoutStatus.confirmed,
		},
		select: { id: true },
		orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
	});
	expect(created).toBeDefined();
});

test('edit payout', async ({ page }) => {
	const unique = Date.now();
	const firstName = `Payout-${unique}`;
	const lastName = 'Editor';

	const programWithOperatorAccess = await prisma.program.findFirst({
		where: {
			programAccesses: {
				some: {
					permission: 'operator',
				},
			},
		},
		select: { id: true },
	});
	const localPartner = await prisma.localPartner.findFirst({
		select: { id: true },
	});
	expect(programWithOperatorAccess?.id).toBeTruthy();
	expect(localPartner?.id).toBeTruthy();

	const createdRecipient = await prisma.recipient.create({
		data: {
			program: { connect: { id: programWithOperatorAccess!.id } },
			localPartner: { connect: { id: localPartner!.id } },
			contact: {
				create: {
					firstName,
					lastName,
					email: `payout.editor.${unique}@example.com`,
				},
			},
		},
		select: { id: true },
	});

	const editablePayout = await prisma.payout.create({
		data: {
			recipient: { connect: { id: createdRecipient.id } },
			amount: 50,
			currency: 'USD',
			status: 'confirmed',
			paymentAt: new Date(),
		},
		select: { id: true },
	});

	const updatedAmount = 123.4;

	await page.goto(`/portal/delivery/make-payouts?page=1&pageSize=10&search=${encodeURIComponent(firstName)}`);
	await page.locator('tbody tr').first().locator('td').first().click();
	await page.getByTestId('form-item-amount').locator('input').fill(`${updatedAmount}`);
	await selectOptionByTestId(page, 'status', 'paid');
	await savePayoutAndWait(page);

	const updated = await prisma.payout.findUniqueOrThrow({
		where: { id: editablePayout.id },
		select: { amount: true, status: true },
	});
	expect(Number(updated.amount)).toBe(updatedAmount);
	expect(updated.status).toBe('paid');
});
