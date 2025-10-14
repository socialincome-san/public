import { Prisma } from '@prisma/client';
import { EXCHANGE_RATES_PATH, ExchangeRatesEntry } from '@socialincome/shared/src/types/exchange-rates';

export { EXCHANGE_RATES_PATH };

export type FirestoreExchangeRate = ExchangeRatesEntry & {
	id: string;
};

export type ExchangeRateCreateInput = Prisma.ExchangeRateCreateInput;

export type TransformedExchangeRate = {
	legacyFirestoreId: string;
	currency: string;
	rate: number;
	timestamp: Date;
};
