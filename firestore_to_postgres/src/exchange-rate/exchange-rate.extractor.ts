import { EXCHANGE_RATES_PATH, ExchangeRatesEntry } from '@socialincome/shared/src/types/exchange-rates';
import { BaseExtractor } from '../core/base.extractor';

export class ExchangeRatesExtractor extends BaseExtractor<ExchangeRatesEntry> {
	extract = async (): Promise<ExchangeRatesEntry[]> => {
		return await this.firestore.getAll<ExchangeRatesEntry>(EXCHANGE_RATES_PATH);
	};
}
