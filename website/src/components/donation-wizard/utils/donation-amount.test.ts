import {
	getDonationAmountWithFeesCovered,
	getDonationDisplayAmount,
	getInitialDonationContext,
	getOnlineTransactionCostChf,
	isAmountValid,
	resolveAmount,
} from './donation-amount';

describe('donation amount', () => {
	it('treats empty custom amount as invalid', () => {
		const context = {
			...getInitialDonationContext(),
			selectedAmount: 'other' as const,
			customAmount: null,
		};

		expect(resolveAmount(context)).toBeNull();
		expect(isAmountValid(context)).toBe(false);
	});
});

describe('stripe transaction costs', () => {
	it('grosses up a typical 1% donation so fees are covered', () => {
		expect(getOnlineTransactionCostChf(60)).toBe(2.1);
		expect(getDonationAmountWithFeesCovered(60)).toBe(62.1);
	});

	it('scales with donation amount', () => {
		expect(getOnlineTransactionCostChf(120)).toBe(3.89);
		expect(getDonationAmountWithFeesCovered(120)).toBe(123.89);
	});

	it('adds gross-up to display amount when covering online fees', () => {
		expect(
			getDonationDisplayAmount({
				...getInitialDonationContext(),
				monthlyIncome: 6000,
				selectedAmount: null,
				paymentMethod: 'online',
				coverTransactionCosts: true,
			}),
		).toBe(62.1);
	});

	it('leaves display amount unchanged when fees are not covered', () => {
		expect(
			getDonationDisplayAmount({
				...getInitialDonationContext(),
				monthlyIncome: 6000,
				selectedAmount: null,
				paymentMethod: 'online',
				coverTransactionCosts: false,
			}),
		).toBe(60);
	});
});
