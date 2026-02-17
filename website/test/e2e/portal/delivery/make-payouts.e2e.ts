import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

const expected = {
	step1:
		'MobileNumber*,UniqueCode*,UserType*91234567,OM-SL-001,subscriber77111222,OM-SL-002,subscriber88765432,OM-SL-003,subscriber',

	step2:
		'MobileNumber*,Amount*,FirstName,LastName,IdNumber,Remarks*,UserType*91234567,50,Aminata,Kamara,OM-SL-001,SocialIncomeMarch2025,subscriber77111222,50,Mohamed,Bangura,OM-SL-002,SocialIncomeMarch2025,subscriber88765432,50,Isatu,Conteh,OM-SL-003,SocialIncomeMarch2025,subscriber',

	step3: [
		{
			amount: 50,
			amountChf: 2.0833333333333335,
			currency: 'SLE',
			firstName: 'Aminata',
			lastName: 'Kamara',
			paymentAt: '2025-03-12T11:00:00.000Z',
			phoneNumber: '+41791234567',
			recipientId: 'recipient-1',
			status: 'paid',
		},
		{
			amount: 50,
			amountChf: 2.0833333333333335,
			currency: 'SLE',
			firstName: 'Mohamed',
			lastName: 'Bangura',
			paymentAt: '2025-03-12T11:00:00.000Z',
			phoneNumber: '+23277111222',
			recipientId: 'recipient-2',
			status: 'paid',
		},
		{
			amount: 50,
			amountChf: 2.0833333333333335,
			currency: 'SLE',
			firstName: 'Isatu',
			lastName: 'Conteh',
			paymentAt: '2025-03-12T11:00:00.000Z',
			phoneNumber: '+23288765432',
			recipientId: 'recipient-3',
			status: 'paid',
		},
	],

	step4: 'Created 3 payouts for 2025-03',
};

test('Payout Process', async ({ page }) => {
	await page.goto('/portal/delivery/make-payouts');

	await page.getByRole('button', { name: 'Start payout process' }).click();

	await page.getByTestId('date-picker-button').click();
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByLabel('Choose the Year').selectOption('2025');
	await page.getByRole('button', { name: 'Wednesday, March 12th,' }).click();

	await page.getByTestId('payout-step-1-button').click();

	await page
		.getByTestId('step-result-box-1')
		.innerText()
		.then((text) => {
			expect(text.replace(/\s+/g, '')).toContain(expected.step1);
		});

	await page.getByTestId('payout-step-2-button').click();

	await page
		.getByTestId('step-result-box-2')
		.innerText()
		.then((text) => {
			expect(text.replace(/\s+/g, '')).toContain(expected.step2);
		});

	await page.getByTestId('payout-step-3-button').click();

	await page
		.getByTestId('step-result-box-3')
		.innerText()
		.then((text) => {
			const data = JSON.parse(text);

			expect(data).toHaveLength(expected.step3.length);

			for (const r of expected.step3) {
				expect(data).toEqual(
					expect.arrayContaining([
						expect.objectContaining({
							amount: r.amount,
							amountChf: r.amountChf,
							currency: r.currency,
							firstName: r.firstName,
							lastName: r.lastName,
							paymentAt: r.paymentAt,
							phoneNumber: r.phoneNumber,
							recipientId: r.recipientId,
							status: r.status,
						}),
					]),
				);
			}
		});

	await page.getByTestId('payout-step-4-button').click();

	await page
		.getByTestId('step-result-box-4')
		.innerText()
		.then((text) => {
			expect(text).toContain(expected.step4);
		});
});
