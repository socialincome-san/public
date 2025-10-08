import { ExchangeRate } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateExchangeRateInput, ExchangeRates } from './exchange-rate.types';

export class ExchangeRateService extends BaseService {
	async create(input: CreateExchangeRateInput): Promise<ServiceResult<ExchangeRate>> {
		try {
			const rate = await this.db.exchangeRate.create({
				data: input,
			});
			return this.resultOk(rate);
		} catch {
			return this.resultFail('Could not create exchange rate');
		}
	}

	async getLatestRates(): Promise<ServiceResult<ExchangeRates>> {
		try {
			const latestTimestamp = await this.db.exchangeRate.findFirst({
				orderBy: { timestamp: 'desc' },
				select: { timestamp: true },
			});

			if (!latestTimestamp) {
				return this.resultFail('No exchange rates found');
			}

			const latestRates = await this.db.exchangeRate.findMany({
				where: { timestamp: latestTimestamp.timestamp },
				select: { currency: true, rate: true },
			});

			if (!latestRates || latestRates.length === 0) {
				return this.resultFail('No exchange rates found for latest timestamp');
			}

			const rates = Object.fromEntries(latestRates.map((r) => [r.currency, Number(r.rate)])) as ExchangeRates;

			return this.resultOk(rates);
		} catch {
			return this.resultFail('Could not fetch latest exchange rates');
		}
	}
}
