import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRates } from './exchange-rate.types';

export class ExchangeRateService extends BaseService {
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
		} catch {
			return this.resultFail('Could not fetch latest exchange rates');
		}
	}
}
