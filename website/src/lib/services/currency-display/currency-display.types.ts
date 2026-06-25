import type { Currency } from '@/generated/prisma/client';
import type { WebsiteCurrency } from '@/lib/i18n/utils';

export type DisplayAmount = {
	amount: number;
	currency: Currency;
};

export type WalletPayoutDisplayInput = {
	totalPayoutsSum: number;
	totalPayoutsSumChf: number;
	payoutCurrency: Currency;
	displayCurrency: WebsiteCurrency;
};
