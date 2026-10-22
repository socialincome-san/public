import { getDonationDisplayAmount, getInitialDonationContext, type DonationAmountContext } from '../utils/donation-amount';
import { toResumableDonation } from './resumable-donation';

const withContext = (overrides: Partial<DonationAmountContext>): DonationAmountContext => ({
	...getInitialDonationContext(),
	selectedAmount: 50,
	cadence: 'monthly',
	...overrides,
});

describe('toResumableDonation', () => {
	test('offers the chosen amount without the fee before the payment step', () => {
		const donation = toResumableDonation(withContext({ paymentMethod: 'qr', coverTransactionCosts: true }), false);

		expect(donation).toMatchObject({ paymentMethod: 'online', coverTransactionCosts: false });
		expect(donation && getDonationDisplayAmount(donation)).toBe(50);
	});

	test('keeps the fee when it was chosen with online payment on the payment step', () => {
		const donation = toResumableDonation(withContext({ paymentMethod: 'online', coverTransactionCosts: true }), true);

		expect(donation?.coverTransactionCosts).toBe(true);
		expect(donation && getDonationDisplayAmount(donation)).toBe(51.5);
	});

	test('drops the fee when the payment step was left on QR', () => {
		const donation = toResumableDonation(withContext({ paymentMethod: 'qr', coverTransactionCosts: true }), true);

		expect(donation?.coverTransactionCosts).toBe(false);
	});

	test('keeps only the amount fields', () => {
		const wizardContext = {
			...withContext({ campaignId: 'campaign-1' }),
			qrDonor: { email: 'donor@example.org' },
			stripeClientSecret: 'secret',
		};

		expect(toResumableDonation(wizardContext, false)).toEqual({
			...withContext({ campaignId: 'campaign-1' }),
			paymentMethod: 'online',
			coverTransactionCosts: false,
		});
	});
});

describe('toResumableDonation plan choices', () => {
	test('offers half the one-time amount monthly when that plan was picked', () => {
		const donation = toResumableDonation(
			withContext({
				selectedAmount: 100,
				cadence: 'one-time',
				oneTimePlanChoice: 'monthly-half',
				returnsToOneTimePlanStep: true,
			}),
			false,
		);

		expect(donation).toMatchObject({ cadence: 'monthly', chargeMonthlyHalfOfOneTimeAmount: true });
		expect(donation && getDonationDisplayAmount(donation)).toBe(50);
	});

	test('keeps the monthly tier', () => {
		const donation = toResumableDonation(withContext({ selectedTier: '2x' }), false);

		expect(donation && getDonationDisplayAmount(donation)).toBe(100);
	});
});
