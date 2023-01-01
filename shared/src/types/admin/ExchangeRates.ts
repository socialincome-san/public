export const EXCHANGE_RATES_PATH = 'exchange-rates';

export type ExchangeRatesEntry = {
	base: string;
	timestamp: number;
	rates: ExchangeRates;
};

export type ExchangeRates = Record<string, number>;

export const getIdFromExchangeRates = (exchangeRates: ExchangeRatesEntry) => {
	return exchangeRates.timestamp.toString();
};
