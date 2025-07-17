import { CreateExchangeRateCollectionInput } from '@socialincome/shared/src/database/services/exchange-rate-collection/exchange-rate-collection.types';
import { CreateExchangeRateItemInput } from '@socialincome/shared/src/database/services/exchange-rate-item/exchange-rate-item.types';
import { ExchangeRatesEntry } from '@socialincome/shared/src/types/exchange-rates';
import { BaseTransformer } from '../core/base.transformer';

export type CreateExchangeRateItemInputWithoutFK = Omit<CreateExchangeRateItemInput, 'collectionId'>;

export type ExchangeRateTransformed = {
	collection: CreateExchangeRateCollectionInput;
	items: CreateExchangeRateItemInputWithoutFK[];
};

export class ExchangeRatesTransformer extends BaseTransformer<ExchangeRatesEntry, ExchangeRateTransformed> {
	transform = async (input: ExchangeRatesEntry[]): Promise<ExchangeRateTransformed[]> => {
		return input.map((entry): ExchangeRateTransformed => {
			const collection: CreateExchangeRateCollectionInput = {
				base: entry.base,
				timestamp: new Date(entry.timestamp * 1000),
			};

			const items: CreateExchangeRateItemInputWithoutFK[] = Object.entries(entry.rates ?? {}).map(
				([currency, rate]) => ({
					currency,
					rate,
				}),
			);

			return { collection, items };
		});
	};
}
