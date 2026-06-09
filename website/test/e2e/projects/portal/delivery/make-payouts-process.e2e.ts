import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

const expected = {
	orangeStep1Header: 'MobileNumber*,UniqueCode*,UserType*',
	orangeStep2Header: 'MobileNumber*,Amount*,FirstName,LastName,IdNumber,Remarks*,UserType*',
	telecelStep1Header: 'MSISDN,Amount,Telco',
	stepCreated: 'Created',
};

const selectPayoutMonth = async (page: import('@playwright/test').Page) => {
	await page.getByTestId('payout-overview-month-picker').getByTestId('date-picker-button').click();
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByLabel('Choose the Year').selectOption('2025');
	await page.getByRole('button', { name: 'Wednesday, March 12th,' }).click();
};

test('Payout process overview shows providers and recipient counts', async ({ page }) => {
	await page.goto('/portal/delivery/overview');

	await expect(page.getByTestId('payout-overview-month-picker')).toBeVisible();
	await expect(page.getByTestId('start-payout-process-mobile-money-provider-id-3')).toBeVisible();
	await expect(page.getByTestId('start-payout-process-mobile-money-provider-id-4')).toBeVisible();
	await expect(page.getByTestId('start-payout-process-telecel_csv')).toBeVisible();

	const orangeMoneySlCount = page.getByTestId('payout-recipient-count-mobile-money-provider-id-3');
	await expect(orangeMoneySlCount).not.toHaveText('Loading recipient count…');
	await expect(orangeMoneySlCount).toContainText(/recipient(s)? would receive a payout/);

	const orangeMoneyLrCount = page.getByTestId('payout-recipient-count-mobile-money-provider-id-4');
	await expect(orangeMoneyLrCount).not.toHaveText('Loading recipient count…');
	await expect(orangeMoneyLrCount).toContainText(/recipient(s)? would receive a payout/);

	const telecelCount = page.getByTestId('payout-recipient-count-telecel_csv');
	await expect(telecelCount).not.toHaveText('Loading recipient count…');
	await expect(telecelCount).toContainText(/recipient(s)? would receive a payout/);
});

test('Orange Money payout process', async ({ page }) => {
	await page.goto('/portal/delivery/overview');
	await selectPayoutMonth(page);

	const startButton = page.getByTestId('start-payout-process-mobile-money-provider-id-3');
	await expect(startButton).toBeEnabled();
	await startButton.click();

	await page.getByTestId('payout-step-1-button').click();
	await page
		.getByTestId('step-result-box-1')
		.innerText()
		.then((text) => {
			expect(text.replace(/\s+/g, '')).toContain(expected.orangeStep1Header.replace(/\s+/g, ''));
		});

	await page.getByTestId('payout-step-2-button').click();
	await page
		.getByTestId('step-result-box-2')
		.innerText()
		.then((text) => {
			expect(text.replace(/\s+/g, '')).toContain(expected.orangeStep2Header.replace(/\s+/g, ''));
			expect(text).toContain('Social Income March 2025');
		});

	await page.getByTestId('payout-step-3-button').click();
	await page
		.getByTestId('step-result-box-3')
		.innerText()
		.then((text) => {
			const parsed: unknown = JSON.parse(text);
			expect(Array.isArray(parsed)).toBeTruthy();
			if (!Array.isArray(parsed)) {
				throw new Error('Expected step 3 output to be an array');
			}
			expect(parsed.length).toBeGreaterThan(0);
			expect(parsed).toEqual(
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
			expect(text).toContain(expected.stepCreated);
			expect(text).toContain('payouts for 2025-03');
		});
});

test('Telecel CSV payout process', async ({ page }) => {
	await page.goto('/portal/delivery/overview');
	await selectPayoutMonth(page);

	const startButton = page.getByTestId('start-payout-process-telecel_csv');
	await expect(startButton).toBeEnabled();
	await startButton.click();

	await page.getByTestId('payout-step-1-button').click();
	await page
		.getByTestId('step-result-box-1')
		.innerText()
		.then((text) => {
			expect(text.replace(/\s+/g, '')).toContain(expected.telecelStep1Header.replace(/\s+/g, ''));
			expect(text).toMatch(/233\d+,950,(Telecel|ATMoney|MTN MoMo)/);
		});

	await page.getByTestId('payout-step-2-button').click();
	await page
		.getByTestId('step-result-box-2')
		.innerText()
		.then((text) => {
			const parsed: unknown = JSON.parse(text);
			expect(Array.isArray(parsed)).toBeTruthy();
			if (!Array.isArray(parsed)) {
				throw new Error('Expected step 2 output to be an array');
			}
			expect(parsed.length).toBeGreaterThan(0);
		});

	await page.getByTestId('payout-step-3-button').click();
	await page
		.getByTestId('step-result-box-3')
		.innerText()
		.then((text) => {
			expect(text).toContain(expected.stepCreated);
			expect(text).toContain('payouts for 2025-03');
		});
});
