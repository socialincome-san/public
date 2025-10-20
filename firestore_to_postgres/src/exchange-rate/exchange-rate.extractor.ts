import { EXCHANGE_RATES_PATH, ExchangeRatesEntry } from '@socialincome/shared/src/types/exchange-rates';
import { BaseExtractor } from '../core/base.extractor';
import { FirestoreExchangeRate } from './exchange-rate.types';

export class ExchangeRateExtractor extends BaseExtractor<FirestoreExchangeRate> {
	extract = async (): Promise<FirestoreExchangeRate[]> => {
		const snapshot = await this.firestore.collection(EXCHANGE_RATES_PATH).get();
		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...(doc.data() as ExchangeRatesEntry),
		}));
	};
}
