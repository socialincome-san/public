import {
	ONLINE_TRANSACTION_FEE_RATE,
	SUBSCRIPTION_AMOUNT_MAX,
	SUBSCRIPTION_AMOUNT_MIN,
} from '@/modules/subscriptions/subscription.types';

const roundAmount = (amount: number): number => Math.round(amount * 100) / 100;

export const clampSubscriptionAmount = (value: number): number =>
	Math.min(SUBSCRIPTION_AMOUNT_MAX, Math.max(SUBSCRIPTION_AMOUNT_MIN, Math.round(value)));

export const parseSubscriptionAmountInput = (raw: string): number | null => {
	const trimmed = raw.trim();
	if (trimmed === '') {
		return null;
	}

	const parsed = Number(trimmed);

	return Number.isFinite(parsed) ? clampSubscriptionAmount(parsed) : null;
};

export const isSubscriptionAmountInRange = (amount: number): boolean =>
	Number.isInteger(amount) && amount >= SUBSCRIPTION_AMOUNT_MIN && amount <= SUBSCRIPTION_AMOUNT_MAX;

export const canUpdateSubscriptionAmount = (amount: number, initialAmount: number): boolean =>
	isSubscriptionAmountInRange(amount) && amount !== initialAmount;

export const getOnlineTransactionCost = (baseAmount: number): number =>
	baseAmount <= 0 ? 0 : roundAmount(baseAmount * ONLINE_TRANSACTION_FEE_RATE);

export const getAmountWithTransactionCostCoverage = (baseAmount: number): number =>
	roundAmount(baseAmount + getOnlineTransactionCost(baseAmount));

export const getBaseAmountBeforeTransactionCostCoverage = (coveredAmount: number): number =>
	Math.round(coveredAmount / (1 + ONLINE_TRANSACTION_FEE_RATE));
