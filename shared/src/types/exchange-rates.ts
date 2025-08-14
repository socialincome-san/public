export const EXCHANGE_RATES_PATH = 'exchange-rates';

export type ExchangeRatesEntry = {
	base: string;
	timestamp: number;
	rates: Record<string, number>;
};
