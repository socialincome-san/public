import type { Prisma } from '@/generated/prisma/client';
import { Currency } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { ExchangeRateCreateInput, ExchangeRateTableQuery } from './exchange-rate.types';

export const findLatestRates = async () =>
	prisma.$transaction(async (transaction) => {
		const latest = await transaction.exchangeRate.findFirst({
			orderBy: { timestamp: 'desc' },
			select: { timestamp: true },
		});
		if (!latest) {
			return [];
		}

		return transaction.exchangeRate.findMany({
			where: { timestamp: latest.timestamp },
			select: { currency: true, rate: true },
		});
	});

export const findLatestRateForCurrency = async (currency: Currency) =>
	prisma.exchangeRate.findFirst({
		where: { currency },
		select: { currency: true, rate: true },
		orderBy: { timestamp: 'desc' },
	});

export const findPaginatedExchangeRates = async (query: ExchangeRateTableQuery, earliestTimestamp: Date) => {
	const search = query.search.trim();
	const currencyValues = Object.values(Currency);
	const selectedCurrency = currencyValues.find((currency) => currency === query.currency?.trim());
	const searchMatchingCurrencies = search
		? currencyValues.filter((currency) => currency.toLowerCase().includes(search.toLowerCase()))
		: undefined;
	const effectiveCurrencies = selectedCurrency
		? searchMatchingCurrencies
			? searchMatchingCurrencies.includes(selectedCurrency)
				? [selectedCurrency]
				: []
			: [selectedCurrency]
		: searchMatchingCurrencies;
	const where: Prisma.ExchangeRateWhereInput = {
		AND: [
			{ timestamp: { gte: earliestTimestamp } },
			...(search
				? [
						{
							OR: [
								{ id: { contains: search, mode: 'insensitive' as const } },
								...(effectiveCurrencies ? [{ currency: { in: effectiveCurrencies } }] : []),
							],
						},
					]
				: effectiveCurrencies
					? [{ currency: { in: effectiveCurrencies } }]
					: []),
		],
	};

	const [rates, totalCount, currencySource] = await Promise.all([
		prisma.exchangeRate.findMany({
			where,
			select: {
				id: true,
				currency: true,
				timestamp: true,
				createdAt: true,
				rate: true,
			},
			orderBy: buildExchangeRateOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.exchangeRate.count({ where }),
		prisma.exchangeRate.findMany({
			where: { timestamp: { gte: earliestTimestamp } },
			select: { currency: true },
		}),
	]);

	return { rates, totalCount, currencySource };
};

export const findExchangeRatesSince = async (date: Date) =>
	prisma.exchangeRate.findMany({
		where: { timestamp: { gte: date } },
		select: {
			currency: true,
			rate: true,
			timestamp: true,
		},
		orderBy: { timestamp: 'asc' },
	});

export const findDailyUsdAndEthRates = async (start: Date, end: Date) =>
	prisma.exchangeRate.findMany({
		where: {
			currency: { in: [Currency.ETH, Currency.USD] },
			timestamp: {
				gte: start,
				lt: end,
			},
		},
		select: {
			currency: true,
			rate: true,
		},
	});

export const createExchangeRates = async (data: ExchangeRateCreateInput[]) => prisma.exchangeRate.createMany({ data });

export const createExchangeRate = async (data: ExchangeRateCreateInput) =>
	prisma.exchangeRate.create({
		data,
		select: { id: true },
	});

const buildExchangeRateOrderBy = (query: ExchangeRateTableQuery): Prisma.ExchangeRateOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['id', 'currency', 'rate', 'timestamp', 'createdAt'] as const);

	switch (sortBy) {
		case 'id':
			return [{ id: direction }];
		case 'currency':
			return [{ currency: direction }];
		case 'rate':
			return [{ rate: direction }];
		case 'timestamp':
			return [{ timestamp: direction }];
		case 'createdAt':
			return [{ createdAt: direction }];
		default:
			return [{ timestamp: 'desc' }];
	}
};
