import { Currency, Prisma } from '@/generated/prisma/client';
import { now } from '@/lib/utils/now';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import {
	ExchangeRate,
	ExchangeRateTableQuery,
	ExchangeRates,
	ExchangeRatesPaginatedTableView,
	ExchangeRatesTableViewRow,
} from './exchange-rate.types';

export class ExchangeRateReadService extends BaseService {
	private userService = new UserReadService();

	private buildExchangeRateOrderBy(query: ExchangeRateTableQuery): Prisma.ExchangeRateOrderByWithRelationInput[] {
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
	}

	async getLatestRates(): Promise<ServiceResult<ExchangeRates>> {
		try {
			const result = await this.db.$transaction(async (tx) => {
				const latest = await tx.exchangeRate.findFirst({
					orderBy: { timestamp: 'desc' },
					select: { timestamp: true },
				});

				if (!latest) {
					return null;
				}

				const latestRates = await tx.exchangeRate.findMany({
					where: { timestamp: latest.timestamp },
					select: { currency: true, rate: true },
				});

				if (latestRates.length === 0) {
					return null;
				}

				return Object.fromEntries(latestRates.map((r) => [r.currency, Number(r.rate)])) as ExchangeRates;
			});

			if (!result) {
				return this.resultFail('No exchange rates found');
			}

			return this.resultOk(result);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch latest exchange rates: ${JSON.stringify(error)}`);
		}
	}

	async getLatestRateForCurrency(currency: Currency): Promise<ServiceResult<ExchangeRate>> {
		try {
			const result = await this.db.exchangeRate.findFirst({
				where: { currency },
				select: { currency: true, rate: true },
				orderBy: { timestamp: 'desc' },
			});

			if (!result) {
				return this.resultFail('No exchange rate found');
			}

			return this.resultOk({
				...result,
				rate: Number(result.rate),
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch latest exchange rate: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: ExchangeRateTableQuery,
	): Promise<ServiceResult<ExchangeRatesPaginatedTableView>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const oneMonthAgo = now();
			oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
			oneMonthAgo.setHours(0, 0, 0, 0);
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
			const where = {
				timestamp: { gte: oneMonthAgo },
				...(effectiveCurrencies ? { currency: { in: effectiveCurrencies } } : {}),
			};
			const [rates, totalCount, currencySource] = await Promise.all([
				this.db.exchangeRate.findMany({
					where,
					select: {
						id: true,
						currency: true,
						timestamp: true,
						createdAt: true,
						rate: true,
					},
					orderBy: this.buildExchangeRateOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.exchangeRate.count({ where }),
				this.db.exchangeRate.findMany({
					where: { timestamp: { gte: oneMonthAgo } },
					select: { currency: true },
				}),
			]);

			const tableRows: ExchangeRatesTableViewRow[] = rates.map((rate) => ({
				id: rate.id,
				currency: rate.currency,
				rate: Number(rate.rate),
				timestamp: rate.timestamp,
				createdAt: rate.createdAt,
			}));
			const currencyFilterOptions = Array.from(new Set(currencySource.map((rate) => rate.currency)))
				.sort()
				.map((currency) => ({ value: currency, label: currency }));

			return this.resultOk({ tableRows, totalCount, currencyFilterOptions });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch exchange rates: ${JSON.stringify(error)}`);
		}
	}
}
