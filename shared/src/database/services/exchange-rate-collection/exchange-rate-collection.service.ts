import { ExchangeRateCollection as PrismaExchangeRateCollection } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateExchangeRateCollectionInput } from './exchange-rate-collection.types';

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
}