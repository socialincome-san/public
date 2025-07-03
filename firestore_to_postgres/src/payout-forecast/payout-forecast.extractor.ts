import { PAYMENT_FORECAST_FIRESTORE_PATH, PaymentForecastEntry } from '@socialincome/shared/src/types/payment-forecast';
import { BaseExtractor } from '../core/base.extractor';

export class PayoutForecastExtractor extends BaseExtractor<PaymentForecastEntry> {
	extract = async (): Promise<PaymentForecastEntry[]> => {
		return await this.firestore.getAll<PaymentForecastEntry>(PAYMENT_FORECAST_FIRESTORE_PATH);
	};
}
