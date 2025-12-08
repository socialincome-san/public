import { Prisma } from '@prisma/client';

export type ExchangeRatesTableViewRow = {
	id: string;
	currency: string;
	rate: number;
	timestamp: Date;
	createdAt: Date;
};

export type ExchangeRate = {
	currency: string;
	rate: number;
};

export type ExchangeRatesTableView = {
	tableRows: ExchangeRatesTableViewRow[];
};

/**
 * A dictionary of currency codes and numeric rates.
 * Example: { USD: 1, EUR: 0.91, SLL: 22250 }
 */
export type ExchangeRates = Record<string, number>;
export type ExchangeRateCreateInput = Prisma.ExchangeRateCreateInput;
