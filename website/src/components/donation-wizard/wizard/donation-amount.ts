export type PresetAmount = 25 | 50 | 100;
export type Cadence = 'monthly' | 'one-time';
export type PlanTier = '1x' | '2x';
export type PaymentMethod = 'qr' | 'online';
export type OneTimeCheckoutChoice = 'one-time' | 'monthly-half';

/** Stripe card pricing for CH: 2.9% + CHF 0.30 per charge. */
const STRIPE_CARD_FEE_RATE = 0.029;
const STRIPE_CARD_FEE_FIXED_CHF = 0.3;

const roundChf = (amount: number): number => Math.round(amount * 100) / 100;

/** Gross-up so the net after Stripe fees is at least `baseAmountChf`. */
export const getDonationAmountWithFeesCovered = (baseAmountChf: number): number => {
	if (baseAmountChf <= 0) {
		return 0;
	}

	const gross = (baseAmountChf + STRIPE_CARD_FEE_FIXED_CHF) / (1 - STRIPE_CARD_FEE_RATE);

	return roundChf(gross);
};

export const getOnlineTransactionCostChf = (baseAmountChf: number): number => {
	if (baseAmountChf <= 0) {
		return 0;
	}

	return roundChf(getDonationAmountWithFeesCovered(baseAmountChf) - baseAmountChf);
};

export type DonationAmountContext = {
	monthlyIncome: number;
	selectedAmount: PresetAmount | 'other' | null;
	customAmount: number | null;
	cadence: Cadence;
	selectedTier: PlanTier;
	paymentMethod: PaymentMethod;
	/** True when paying monthly at half the resolved one-time amount. */
	useHalfMonthlyAmount: boolean;
	coverTransactionCosts: boolean;
	/** Selected plan on step 2 one-time (before payment). */
	oneTimeCheckoutChoice: OneTimeCheckoutChoice;
	/** Return from payment step to step 2 one-time instead of step 2 monthly. */
	checkoutFromOneTimeStep: boolean;
};

export const getInitialDonationContext = (): DonationAmountContext => ({
	monthlyIncome: 6000,
	selectedAmount: null,
	customAmount: null,
	cadence: 'monthly',
	selectedTier: '1x',
	paymentMethod: 'qr',
	useHalfMonthlyAmount: false,
	coverTransactionCosts: false,
	oneTimeCheckoutChoice: 'one-time',
	checkoutFromOneTimeStep: false,
});

export const getOnePercentAmount = (monthlyIncome: number): number => Math.round(monthlyIncome / 100);

export const resolveAmount = (context: DonationAmountContext): number | null => {
	if (context.selectedAmount === 'other') {
		if (context.customAmount === null || context.customAmount < 1) {
			return null;
		}

		return context.customAmount;
	}

	if (context.selectedAmount !== null) {
		return context.selectedAmount;
	}

	if (context.monthlyIncome >= 1) {
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

	if (context.useHalfMonthlyAmount) {
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
		return getDonationAmountWithFeesCovered(base);
	}

	return base;
};

export const isAmountValid = (context: DonationAmountContext): boolean => resolveAmount(context) !== null;

export const isOnePercentPlanSelected = (context: DonationAmountContext): boolean => context.selectedAmount === null;

const SOCIAL_INCOME_MONTHLY_CHF = 30;

export const getBeneficiaryCount = (monthlyAmount: number): number =>
	Math.max(1, Math.floor(monthlyAmount / SOCIAL_INCOME_MONTHLY_CHF));
