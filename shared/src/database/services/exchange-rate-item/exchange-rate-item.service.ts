import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateExchangeRateItemInput } from './exchange-rate-item.types';

export class ExchangeRateItemService extends BaseService {
	async createMany(inputs: CreateExchangeRateItemInput[]): Promise<ServiceResult<number>> {
		try {
			const result = await this.db.exchangeRateItem.createMany({
				data: inputs,
			});
			return this.resultOk(result.count);
		} catch (e) {
			console.error('[ExchangeRateItemService.createMany]', e);
			return this.resultFail('Could not create exchange rate items');
		}
	}
}
