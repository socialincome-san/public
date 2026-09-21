import type { Currency } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

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

export type ExchangeRates = Partial<Record<Currency, number>>;

export type ExchangeRateCreateInput = {
	currency: Currency;
	rate: number;
	timestamp: Date;
};

export type ExchangeRateReadService = {
	getLatestRates: () => Promise<ServiceResult<ExchangeRates>>;
	getLatestRateForCurrency: (currency: Currency) => Promise<ServiceResult<ExchangeRate>>;
};
