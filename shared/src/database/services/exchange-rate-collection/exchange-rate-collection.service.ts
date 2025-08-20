import { ExchangeRateCollection as PrismaExchangeRateCollection } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateExchangeRateCollectionInput, ExchangeRates } from './exchange-rate-collection.types';

export class ExchangeRateCollectionService extends BaseService {
	async create(input: CreateExchangeRateCollectionInput): Promise<ServiceResult<PrismaExchangeRateCollection>> {
		try {
			const exchangeRateCollection = await this.db.exchangeRateCollection.create({
				data: input,
			});
			return this.resultOk(exchangeRateCollection);
		} catch (e) {
			console.error('[ExchangeRateCollectionService.create]', e);
			return this.resultFail('Could not create exchange rate collection');
		}
	}

	async getLatestRates(): Promise<ServiceResult<ExchangeRates>> {
		try {
			const latest = await this.db.exchangeRateCollection.findFirst({
				orderBy: { timestamp: 'desc' },
				include: {
					items: {
						select: { currency: true, rate: true },
					},
				},
			});

			if (!latest) {
				return this.resultFail('No exchange rate collections found');
			}
			if (!latest.items || latest.items.length === 0) {
				return this.resultFail('No exchange rates found');
			}

			const rates = Object.fromEntries(latest.items.map((item) => [item.currency, item.rate])) as ExchangeRates;

			return this.resultOk(rates);
		} catch (e) {
			console.error('[ExchangeRateCollectionService.getLatestRates]', e);
			return this.resultFail('Could not fetch latest exchange rates');
		}
	}
}
