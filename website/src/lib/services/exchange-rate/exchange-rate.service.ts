import { Currency } from '@/generated/prisma/client';
import { now } from '@/lib/utils/now';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserService } from '../user/user.service';
import { ExchangeRateImportService } from './exchange-rate-import.service';
import { ExchangeRate, ExchangeRates, ExchangeRatesTableView, ExchangeRatesTableViewRow } from './exchange-rate.types';
export class ExchangeRateService extends BaseService {
	private userService = new UserService();
	private importService = new ExchangeRateImportService();

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

	async getTableView(userId: string): Promise<ServiceResult<ExchangeRatesTableView>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const oneMonthAgo = now();
			oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
			oneMonthAgo.setHours(0, 0, 0, 0);
			const rates = await this.db.exchangeRate.findMany({
				where: { timestamp: { gte: oneMonthAgo } },
				select: {
					id: true,
					currency: true,
					timestamp: true,
					createdAt: true,
					rate: true,
				},
				orderBy: { timestamp: 'desc' },
			});

			const tableRows: ExchangeRatesTableViewRow[] = rates.map((rate) => ({
				id: rate.id,
				currency: rate.currency,
				rate: Number(rate.rate),
				timestamp: rate.timestamp,
				createdAt: rate.createdAt,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch exchange rates: ${JSON.stringify(error)}`);
		}
	}

	async triggerImportAsAdmin(userId: string): Promise<ServiceResult<void>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		return await this.importService.import();
	}
}
