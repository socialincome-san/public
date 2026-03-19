/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

const expected = {
	step1Header: 'MobileNumber*,UniqueCode*,UserType*',
	step2Header: 'MobileNumber*,Amount*,FirstName,LastName,IdNumber,Remarks*,UserType*',
	step4: 'Created',
};

test.only('Payout Process', async ({ page }) => {
	await page.goto('/portal/delivery/make-payouts');
	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-start-payout-process').click();

	await page.getByTestId('date-picker-button').click();
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByLabel('Choose the Year').selectOption('2025');
	await page.getByRole('button', { name: 'Wednesday, March 12th,' }).click();

	await page.getByTestId('payout-step-1-button').click();
	await page
		.getByTestId('step-result-box-1')
		.innerText()
		.then((text) => {
			expect(text.replace(/\s+/g, '')).toContain(expected.step1Header.replace(/\s+/g, ''));
		});

	await page.getByTestId('payout-step-2-button').click();
	await page
		.getByTestId('step-result-box-2')
		.innerText()
		.then((text) => {
			expect(text.replace(/\s+/g, '')).toContain(expected.step2Header.replace(/\s+/g, ''));
			expect(text).toContain('SocialIncomeMarch2025');
		});

	await page.getByTestId('payout-step-3-button').click();
	await page
		.getByTestId('step-result-box-3')
		.innerText()
		.then((text) => {
			const data = JSON.parse(text);
			expect(Array.isArray(data)).toBeTruthy();
			expect(data.length).toBeGreaterThan(0);
			expect(data).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						currency: expect.any(String),
						firstName: expect.any(String),
						lastName: expect.any(String),
						recipientId: expect.any(String),
						status: 'paid',
					}),
				]),
			);
		});

	await page.getByTestId('payout-step-4-button').click();
	await page
		.getByTestId('step-result-box-4')
		.innerText()
		.then((text) => {
			expect(text).toContain(expected.step4);
			expect(text).toContain('payouts for 2025-03');
		});
});
