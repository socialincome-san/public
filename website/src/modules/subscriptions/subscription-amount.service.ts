import {
	COVER_TRANSACTION_COSTS_METADATA_KEY,
	ONLINE_TRANSACTION_FEE_RATE,
	SUBSCRIPTION_AMOUNT_MAX,
	SUBSCRIPTION_AMOUNT_MIN,
} from './subscription.types';

const roundAmount = (amount: number): number => Math.round(amount * 100) / 100;

const getOnlineTransactionCost = (baseAmount: number): number => {
	if (baseAmount <= 0) {
		return 0;
	}

	return roundAmount(baseAmount * ONLINE_TRANSACTION_FEE_RATE);
};

export const subscriptionAmount = {
	coverTransactionCostsMetadataKey: COVER_TRANSACTION_COSTS_METADATA_KEY,
	isSubscriptionAmountInRange: (amount: number): boolean =>
		Number.isInteger(amount) && amount >= SUBSCRIPTION_AMOUNT_MIN && amount <= SUBSCRIPTION_AMOUNT_MAX,
	getAmountWithTransactionCostCoverage: (baseAmount: number): number =>
		roundAmount(baseAmount + getOnlineTransactionCost(baseAmount)),
	mapCoverTransactionCostsMetadata: (metadata: Record<string, string> | null | undefined): boolean =>
		metadata?.[COVER_TRANSACTION_COSTS_METADATA_KEY] === 'true',
	toCoverTransactionCostsMetadataValue: (coverTransactionCosts: boolean): string =>
		coverTransactionCosts ? 'true' : 'false',
	isCoverTransactionCostsAmountInRange: (amount: number): boolean =>
		Number.isFinite(amount) && amount >= SUBSCRIPTION_AMOUNT_MIN && amount <= SUBSCRIPTION_AMOUNT_MAX,
	amountToStripeUnitAmount: (amount: number): number => Math.round(amount * 100),
};
