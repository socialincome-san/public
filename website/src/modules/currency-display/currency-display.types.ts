import type { Currency } from '@/generated/prisma/enums';
import type { WebsiteCurrency } from '@/lib/i18n/utils';

export type DisplayAmount = {
	amount: number;
	currency: Currency;
};

export type ChfAmountsDisplayInput = {
	amounts: number[];
	displayCurrency: WebsiteCurrency;
};

export type WalletPayoutDisplayInput = {
	totalPayoutsSum: number;
	totalPayoutsSumChf: number;
	payoutCurrency: Currency;
};

export type WalletPayoutDisplaysInput = {
	payouts: WalletPayoutDisplayInput[];
	displayCurrency: WebsiteCurrency;
};

export const CURRENCY_DISPLAY_CACHE_TAG = 'currency-display';
