import { Currency, Prisma } from '@/generated/prisma/client';

export type ExchangeRatesTableViewRow = {
	id: string;
	currency: Currency;
	rate: number;
	timestamp: Date;
	createdAt: Date;
};

export type ExchangeRate = {
	currency: Currency;
	rate: number;
};

type ExchangeRatesTableView = {
	tableRows: ExchangeRatesTableViewRow[];
};

export type ExchangeRateTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	currency?: string;
};

export type ExchangeRatesPaginatedTableView = {
	tableRows: ExchangeRatesTableViewRow[];
	totalCount: number;
	currencyFilterOptions: {
		value: string;
		label: string;
	}[];
};

/**
 * A sparse dictionary of currency codes and numeric rates.
 * Example: { USD: 1, EUR: 0.91, SLL: 22250 }
 */
export type ExchangeRates = Partial<Record<Currency, number>>;
export type ExchangeRateCreateInput = Prisma.ExchangeRateCreateInput;

export type ExchangeRateResponse = {
	base: string;
	date: string;
	rates: ExchangeRates;
};
