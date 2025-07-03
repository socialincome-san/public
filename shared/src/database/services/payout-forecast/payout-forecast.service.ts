import { PayoutForecast as PrismaPayoutForecast } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreatePayoutForecastInput } from './payout-forecast.types';

export class PayoutForecastService extends BaseService {
	async create(input: CreatePayoutForecastInput): Promise<ServiceResult<PrismaPayoutForecast>> {
		try {
			const forecast = await this.db.payoutForecast.create({
				data: input,
			});

			return this.resultOk(forecast);
		} catch (e) {
			console.error('[PayoutForecastService.create]', e);
			return this.resultFail('Could not create payout forecast');
		}
	}
}
