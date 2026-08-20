import { SUBSCRIPTION_AMOUNT_MAX, SUBSCRIPTION_AMOUNT_MIN } from './subscription-amount';

const ONLINE_TRANSACTION_FEE_RATE = 0.03;

export const COVER_TRANSACTION_COSTS_METADATA_KEY = 'coverTransactionCosts';

const roundAmount = (amount: number): number => Math.round(amount * 100) / 100;

export const getOnlineTransactionCost = (baseAmount: number): number => {
	if (baseAmount <= 0) {
		return 0;
	}

	return roundAmount(baseAmount * ONLINE_TRANSACTION_FEE_RATE);
};

export const getAmountWithTransactionCostCoverage = (baseAmount: number): number =>
	roundAmount(baseAmount + getOnlineTransactionCost(baseAmount));

export const getBaseAmountBeforeTransactionCostCoverage = (coveredAmount: number): number =>
	Math.round(coveredAmount / (1 + ONLINE_TRANSACTION_FEE_RATE));

export const mapCoverTransactionCostsMetadata = (metadata: Record<string, string> | null | undefined): boolean =>
	metadata?.[COVER_TRANSACTION_COSTS_METADATA_KEY] === 'true';

export const toCoverTransactionCostsMetadataValue = (coverTransactionCosts: boolean): string =>
	coverTransactionCosts ? 'true' : 'false';

export const isCoverTransactionCostsAmountInRange = (amount: number): boolean =>
	Number.isFinite(amount) && amount >= SUBSCRIPTION_AMOUNT_MIN && amount <= SUBSCRIPTION_AMOUNT_MAX;

export const amountToStripeUnitAmount = (amount: number): number => Math.round(amount * 100);
