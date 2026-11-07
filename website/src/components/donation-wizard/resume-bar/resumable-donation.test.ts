import { getDonationDisplayAmount, getInitialDonationContext, type DonationAmountContext } from '../utils/donation-amount';
import { toWalletDonation } from './resumable-donation';

const withContext = (overrides: Partial<DonationAmountContext>): DonationAmountContext => ({
	...getInitialDonationContext('CHF'),
	selectedAmount: 50,
	cadence: 'monthly',
	...overrides,
});

describe('toWalletDonation', () => {
	test('offers the chosen amount without the fee before the payment step', () => {
		const donation = toWalletDonation({
			step: 'stepPlanMonthly',
			context: withContext({ paymentMethod: 'qr', coverTransactionCosts: true }),
		});

		expect(donation).toMatchObject({ paymentMethod: 'online', coverTransactionCosts: false });
		expect(getDonationDisplayAmount(donation)).toBe(50);
	});

	test('keeps the fee when it was chosen with online payment on the payment step', () => {
		const donation = toWalletDonation({
			step: 'stepPayment',
			context: withContext({ paymentMethod: 'online', coverTransactionCosts: true }),
		});

		expect(getDonationDisplayAmount(donation)).toBe(51.5);
	});

	test('drops the fee when the payment step was left on QR', () => {
		const donation = toWalletDonation({
			step: 'stepPayment',
			context: withContext({ paymentMethod: 'qr', coverTransactionCosts: true }),
		});

		expect(donation.coverTransactionCosts).toBe(false);
	});

	test('offers half the one-time amount monthly when that plan was picked', () => {
		const donation = toWalletDonation({
			step: 'stepPlanOneTime',
			context: withContext({
				selectedAmount: 100,
				cadence: 'one-time',
				oneTimePlanChoice: 'monthly-half',
				returnsToOneTimePlanStep: true,
			}),
		});

		expect(donation).toMatchObject({ cadence: 'monthly', chargeMonthlyHalfOfOneTimeAmount: true });
		expect(getDonationDisplayAmount(donation)).toBe(50);
	});

	test('keeps the monthly tier', () => {
		const donation = toWalletDonation({ step: 'stepPlanMonthly', context: withContext({ selectedTier: '2x' }) });

		expect(getDonationDisplayAmount(donation)).toBe(100);
	});
});
