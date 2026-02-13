import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

const expected = {
	step1:
		'MobileNumber*,UniqueCode*,UserType*91234567,OM-SL-001,subscriber91234567,OM-SL-001,subscriber91234567,OM-SL-001,subscriber77111222,OM-SL-002,subscriber88765432,OM-SL-003,subscriber',

	step2:
		'MobileNumber*,Amount*,FirstName,LastName,IdNumber,Remarks*,UserType*91234567,50,Aminata,Kamara,OM-SL-001,SocialIncomeMarch2025,subscriber91234567,40,John,Badingu,OM-SL-001,SocialIncomeMarch2025,subscriber91234567,60,Mariatu,Koroma,OM-SL-001,SocialIncomeMarch2025,subscriber77111222,60,Joseph,Conteh,OM-SL-002,SocialIncomeMarch2025,subscriber88765432,50,Isatu,Conteh,OM-SL-003,SocialIncomeMarch2025,subscriber',

	step3Recipients: [
		{ firstName: 'Aminata', lastName: 'Kamara', phoneNumber: '+41791234567', amount: 50 },
		{ firstName: 'John', lastName: 'Badingu', phoneNumber: '+41791234567', amount: 40 },
		{ firstName: 'Mariatu', lastName: 'Koroma', phoneNumber: '+41791234567', amount: 60 },
		{ firstName: 'Joseph', lastName: 'Conteh', phoneNumber: '+23277111222', amount: 60 },
		{ firstName: 'Isatu', lastName: 'Conteh', phoneNumber: '+23288765432', amount: 50 },
	],

	step4: 'Created 5 payouts for 2025-03',
	step5: '[]',
	step6: 'No recipients to update',
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

			expect(data).toHaveLength(expected.step3Recipients.length);

			for (const r of expected.step3Recipients) {
				expect(data).toEqual(
					expect.arrayContaining([
						expect.objectContaining({
							firstName: r.firstName,
							lastName: r.lastName,
							phoneNumber: r.phoneNumber,
							currency: 'SLE',
							amount: r.amount,
							amountChf: expect.any(Number),
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

	await page.getByTestId('payout-step-5-button').click();

	await page
		.getByTestId('step-result-box-5')
		.innerText()
		.then((text) => {
			expect(text).toContain(expected.step5);
		});

	await page.getByTestId('payout-step-6-button').click();

	await page
		.getByTestId('step-result-box-6')
		.innerText()
		.then((text) => {
			expect(text).toContain(expected.step6);
		});
});
