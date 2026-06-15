import {
	getBeneficiaryCount,
	getDonationBaseAmount,
	getDonationDisplayAmount,
	getInitialDonationContext,
	getMonthlyPlanBaseAmount,
	getMonthlyUpsellAmount,
	getOnePercentAmount,
	getOnlineTransactionCost,
	getTierAmounts,
	isAmountValid,
	resolveAmount,
	type DonationAmountContext,
} from './donation-amount';

const withContext = (overrides: Partial<DonationAmountContext>): DonationAmountContext => ({
	...getInitialDonationContext(),
	...overrides,
});

describe('donation-amount', () => {
	describe('getOnlineTransactionCost', () => {
		test('returns 3% of the base amount rounded to two decimals', () => {
			expect(getOnlineTransactionCost(100)).toBe(3);
			expect(getOnlineTransactionCost(75)).toBe(2.25);
		});

		test('returns 0 for non-positive amounts', () => {
			expect(getOnlineTransactionCost(0)).toBe(0);
			expect(getOnlineTransactionCost(-10)).toBe(0);
		});
	});

	describe('resolveAmount', () => {
		test('uses one percent of monthly income by default', () => {
			expect(resolveAmount(withContext({ monthlyIncome: 7500, selectedAmount: null }))).toBe(75);
		});

		test('uses preset amount when selected', () => {
			expect(resolveAmount(withContext({ selectedAmount: 50 }))).toBe(50);
		});

		test('uses custom amount when other is selected', () => {
			expect(resolveAmount(withContext({ selectedAmount: 'other', customAmount: 42 }))).toBe(42);
		});

		test('returns null for invalid custom amount', () => {
			expect(resolveAmount(withContext({ selectedAmount: 'other', customAmount: null }))).toBeNull();
		});
	});

	describe('getDonationDisplayAmount', () => {
		test('adds transaction cost when covering fees for online payments', () => {
			const context = withContext({
				monthlyIncome: 7500,
				selectedAmount: null,
				paymentMethod: 'online',
				coverTransactionCosts: true,
			});

			expect(getDonationDisplayAmount(context)).toBe(77.25);
		});

		test('does not add transaction cost for QR payments', () => {
			const context = withContext({
				monthlyIncome: 7500,
				selectedAmount: null,
				paymentMethod: 'qr',
				coverTransactionCosts: true,
			});

			expect(getDonationDisplayAmount(context)).toBe(75);
		});
	});

	describe('getDonationBaseAmount', () => {
		test('doubles monthly amount for 2x tier', () => {
			const context = withContext({
				cadence: 'monthly',
				monthlyIncome: 7500,
				selectedAmount: null,
				selectedTier: '2x',
			});

			expect(getDonationBaseAmount(context)).toBe(150);
		});

		test('uses monthly upsell amount for one-time to monthly conversion', () => {
			const context = withContext({
				cadence: 'monthly',
				monthlyIncome: 7500,
				selectedAmount: null,
				chargeMonthlyHalfOfOneTimeAmount: true,
			});

			expect(getMonthlyPlanBaseAmount(context)).toBe(38);
			expect(getDonationBaseAmount(context)).toBe(38);
		});
	});

	describe('getMonthlyUpsellAmount', () => {
		test('rounds half of one-time amount with a minimum of 1', () => {
			expect(getMonthlyUpsellAmount(75)).toBe(38);
			expect(getMonthlyUpsellAmount(1)).toBe(1);
		});
	});

	describe('getTierAmounts', () => {
		test('returns 1x and 2x amounts', () => {
			expect(getTierAmounts(50)).toEqual({ tier1x: 50, tier2x: 100 });
		});
	});

	describe('getOnePercentAmount', () => {
		test('rounds monthly income divided by 100', () => {
			expect(getOnePercentAmount(7550)).toBe(76);
		});
	});

	describe('isAmountValid', () => {
		test('is true when resolveAmount returns a value', () => {
			expect(isAmountValid(withContext({ monthlyIncome: 6000, selectedAmount: null }))).toBe(true);
		});
	});

	describe('getBeneficiaryCount', () => {
		test('counts beneficiaries in 30 CHF steps', () => {
			expect(getBeneficiaryCount(75)).toBe(2);
			expect(getBeneficiaryCount(29)).toBe(0);
		});
	});
});
