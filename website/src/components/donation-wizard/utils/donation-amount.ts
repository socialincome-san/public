export type PresetAmount = 25 | 50 | 100;
export type Cadence = 'monthly' | 'one-time';
export type PlanTier = '1x' | '2x';
export type PaymentMethod = 'qr' | 'online';
export type OneTimePlanChoice = 'one-time' | 'monthly-half';

const ONLINE_TRANSACTION_FEE_RATE = 0.03;

export const DONATION_MONTHLY_INCOME_MIN = 50;
export const DONATION_MONTHLY_INCOME_MAX = 1000_000;
export const DONATION_CUSTOM_AMOUNT_MIN = 1;
export const DONATION_CUSTOM_AMOUNT_MAX = 1000_000;

const roundChf = (amount: number): number => Math.round(amount * 100) / 100;

export const getOnlineTransactionCostChf = (baseAmountChf: number): number => {
	if (baseAmountChf <= 0) {
		return 0;
	}

	return roundChf(baseAmountChf * ONLINE_TRANSACTION_FEE_RATE);
};

export type DonationAmountContext = {
	monthlyIncome: number | null;
	selectedAmount: PresetAmount | 'other' | null;
	customAmount: number | null;
	cadence: Cadence;
	selectedTier: PlanTier;
	paymentMethod: PaymentMethod;
	chargeMonthlyHalfOfOneTimeAmount: boolean;
	coverTransactionCosts: boolean;
	oneTimePlanChoice: OneTimePlanChoice;
	returnsToOneTimePlanStep: boolean;
	campaignId?: string;
};

export const getInitialDonationContext = (): DonationAmountContext => ({
	monthlyIncome: 6000,
	selectedAmount: null,
	customAmount: null,
	cadence: 'monthly',
	selectedTier: '1x',
	paymentMethod: 'qr',
	chargeMonthlyHalfOfOneTimeAmount: false,
	coverTransactionCosts: false,
	oneTimePlanChoice: 'one-time',
	returnsToOneTimePlanStep: false,
	campaignId: undefined,
});

export const getOnePercentAmount = (monthlyIncome: number | null): number =>
	monthlyIncome === null || monthlyIncome < 1 ? 0 : Math.round(monthlyIncome / 100);

export const resolveAmount = (context: DonationAmountContext): number | null => {
	if (context.selectedAmount === 'other') {
		if (
			context.customAmount === null ||
			context.customAmount < DONATION_CUSTOM_AMOUNT_MIN ||
			context.customAmount > DONATION_CUSTOM_AMOUNT_MAX
		) {
			return null;
		}

		return context.customAmount;
	}

	if (context.selectedAmount !== null) {
		return context.selectedAmount;
	}

	if (
		context.monthlyIncome !== null &&
		context.monthlyIncome >= DONATION_MONTHLY_INCOME_MIN &&
		context.monthlyIncome <= DONATION_MONTHLY_INCOME_MAX
	) {
		return getOnePercentAmount(context.monthlyIncome);
	}

	return null;
};

export const getTierAmounts = (baseAmount: number): { tier1x: number; tier2x: number } => ({
	tier1x: baseAmount,
	tier2x: baseAmount * 2,
});

export const getMonthlyUpsellAmount = (oneTimeAmount: number): number => Math.max(1, Math.round(oneTimeAmount / 2));

export const getMonthlyPlanBaseAmount = (context: DonationAmountContext): number => {
	const resolved = resolveAmount(context) ?? 0;

	if (context.chargeMonthlyHalfOfOneTimeAmount) {
		return getMonthlyUpsellAmount(resolved);
	}

	return resolved;
};

const getMonthlyPlanAmount = (context: DonationAmountContext): number => {
	const baseAmount = getMonthlyPlanBaseAmount(context);
	const { tier1x, tier2x } = getTierAmounts(baseAmount);

	return context.selectedTier === '2x' ? tier2x : tier1x;
};

export const getDonationBaseAmount = (context: DonationAmountContext): number => {
	if (context.cadence === 'monthly') {
		return getMonthlyPlanAmount(context);
	}

	return resolveAmount(context) ?? 0;
};

export const getDonationDisplayAmount = (context: DonationAmountContext): number => {
	const base = getDonationBaseAmount(context);

	if (context.paymentMethod === 'online' && context.coverTransactionCosts) {
		return roundChf(base + getOnlineTransactionCostChf(base));
	}

	return base;
};

export const isAmountValid = (context: DonationAmountContext): boolean => resolveAmount(context) !== null;

export const isOnePercentPlanSelected = (context: DonationAmountContext): boolean => context.selectedAmount === null;

const SOCIAL_INCOME_MONTHLY_CHF = 30;

export const getBeneficiaryCount = (monthlyAmount: number): number =>
	Math.max(1, Math.floor(monthlyAmount / SOCIAL_INCOME_MONTHLY_CHF));
