export const SUBSCRIPTION_AMOUNT_MIN = 1;
export const SUBSCRIPTION_AMOUNT_MAX = 5000;

export const clampSubscriptionAmount = (value: number): number =>
	Math.min(SUBSCRIPTION_AMOUNT_MAX, Math.max(SUBSCRIPTION_AMOUNT_MIN, Math.round(value)));

export const parseSubscriptionAmountInput = (raw: string): number | null => {
	const trimmed = raw.trim();
	if (trimmed === '') {
		return null;
	}

	const parsed = Number(trimmed);
	if (!Number.isFinite(parsed)) {
		return null;
	}

	return clampSubscriptionAmount(parsed);
};

export const isSubscriptionAmountInRange = (amount: number): boolean =>
	Number.isInteger(amount) && amount >= SUBSCRIPTION_AMOUNT_MIN && amount <= SUBSCRIPTION_AMOUNT_MAX;

export const canUpdateSubscriptionAmount = (amount: number, initialAmount: number): boolean =>
	isSubscriptionAmountInRange(amount) && amount !== initialAmount;
