import { PayoutForecastService } from '@socialincome/shared/src/database/services/payout-forecast/payout-forecast.service';
import { CreatePayoutForecastInput } from '@socialincome/shared/src/database/services/payout-forecast/payout-forecast.types';
import { BaseImporter } from '../core/base.importer';

export class PayoutForecastImporter extends BaseImporter<CreatePayoutForecastInput> {
	private readonly payoutForecastService = new PayoutForecastService();

	import = async (forecasts: CreatePayoutForecastInput[]): Promise<number> => {
		let createdCount = 0;

		for (const forecast of forecasts) {
			const result = await this.payoutForecastService.create(forecast);

			if (result.success) {
				createdCount++;
			} else {
				console.warn('[PayoutForecastImporter] Skipped forecast entry:', {
					month: forecast.month,
					reason: result.error,
				});
			}
		}

		return createdCount;
	};
}
