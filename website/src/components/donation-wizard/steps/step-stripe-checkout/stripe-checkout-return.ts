import type {
	Cadence,
	DonationAmountContext,
	OneTimePlanChoice,
	PaymentMethod,
	PlanTier,
	PresetAmount,
} from '../../utils/donation-amount';

export const STRIPE_CHECKOUT_SESSION_ID_PARAM = 'donation_checkout_session_id';

const STORAGE_KEY_PREFIX = 'donation-wizard:stripe-checkout:';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isNullableNumber = (value: unknown): value is number | null =>
	value === null || (typeof value === 'number' && Number.isFinite(value));

const isPresetAmount = (value: unknown): value is PresetAmount | 'other' =>
	value === 25 || value === 50 || value === 100 || value === 'other';

const isNullablePresetAmount = (value: unknown): value is PresetAmount | 'other' | null =>
	value === null || isPresetAmount(value);

const isCadence = (value: unknown): value is Cadence => value === 'monthly' || value === 'one-time';

const isPlanTier = (value: unknown): value is PlanTier => value === '1x' || value === '2x';

const isPaymentMethod = (value: unknown): value is PaymentMethod => value === 'qr' || value === 'online';

const isOneTimePlanChoice = (value: unknown): value is OneTimePlanChoice => value === 'one-time' || value === 'monthly-half';

const getStorageKey = (sessionId: string): string => `${STORAGE_KEY_PREFIX}${sessionId}`;

const parseStoredContext = (value: unknown): DonationAmountContext | null => {
	if (!isRecord(value)) {
		return null;
	}

	const {
		monthlyIncome,
		selectedAmount,
		customAmount,
		cadence,
		selectedTier,
		paymentMethod,
		chargeMonthlyHalfOfOneTimeAmount,
		coverTransactionCosts,
		oneTimePlanChoice,
		returnsToOneTimePlanStep,
		campaignId,
	} = value;

	if (
		!isNullableNumber(monthlyIncome) ||
		!isNullablePresetAmount(selectedAmount) ||
		!isNullableNumber(customAmount) ||
		!isCadence(cadence) ||
		!isPlanTier(selectedTier) ||
		!isPaymentMethod(paymentMethod) ||
		typeof chargeMonthlyHalfOfOneTimeAmount !== 'boolean' ||
		typeof coverTransactionCosts !== 'boolean' ||
		!isOneTimePlanChoice(oneTimePlanChoice) ||
		typeof returnsToOneTimePlanStep !== 'boolean' ||
		(campaignId !== undefined && typeof campaignId !== 'string')
	) {
		return null;
	}

	return {
		monthlyIncome,
		selectedAmount,
		customAmount,
		cadence,
		selectedTier,
		paymentMethod,
		chargeMonthlyHalfOfOneTimeAmount,
		coverTransactionCosts,
		oneTimePlanChoice,
		returnsToOneTimePlanStep,
		campaignId,
	};
};

export const buildStripeCheckoutReturnPath = (): string | undefined => {
	if (typeof window === 'undefined') {
		return undefined;
	}

	return window.location.pathname;
};

export const storeStripeCheckoutContext = (sessionId: string, context: DonationAmountContext): void => {
	if (typeof window === 'undefined') {
		return;
	}

	window.sessionStorage.setItem(getStorageKey(sessionId), JSON.stringify(context));
};

export const readStoredStripeCheckoutContext = (sessionId: string): DonationAmountContext | null => {
	if (typeof window === 'undefined') {
		return null;
	}

	const value = window.sessionStorage.getItem(getStorageKey(sessionId));
	if (!value) {
		return null;
	}

	try {
		const parsed: unknown = JSON.parse(value);

		return parseStoredContext(parsed);
	} catch {
		return null;
	}
};

export const clearStoredStripeCheckoutContext = (sessionId: string): void => {
	if (typeof window === 'undefined') {
		return;
	}

	window.sessionStorage.removeItem(getStorageKey(sessionId));
};
