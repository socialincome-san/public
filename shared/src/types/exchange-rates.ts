import { Currency } from './currency';

export const EXCHANGE_RATES_PATH = 'exchange-rates';

export type ExchangeRatesEntry = {
	base: string;
	timestamp: number; // in seconds
	rates: ExchangeRates;
};

export type ExchangeRates = Record<Currency, number>;
