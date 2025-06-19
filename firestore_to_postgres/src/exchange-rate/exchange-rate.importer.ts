import { ExchangeRateCollectionService } from '@socialincome/shared/src/database/services/exchange-rate-collection/exchange-rate-collection.service';
import { ExchangeRateItemService } from '@socialincome/shared/src/database/services/exchange-rate-item/exchange-rate-item.service';
import { BaseImporter } from '../core/base.importer';
import { ExchangeRateTransformed } from './exchange-rate.transformer';

export class ExchangeRatesImporter extends BaseImporter<ExchangeRateTransformed> {
	private readonly collectionService = new ExchangeRateCollectionService();
	private readonly itemService = new ExchangeRateItemService();

	import = async (data: ExchangeRateTransformed[]): Promise<number> => {
		let createdCount = 0;

		for (const { collection, items } of data) {
			const result = await this.collectionService.create(collection);

			if (result.success) {
				const collectionId = result.data.id;

				const itemsWithFK = items.map((item) => ({
					...item,
					collectionId,
				}));

				await this.itemService.createMany(itemsWithFK);
				createdCount++;
			} else {
				console.warn('[ExchangeRatesImporter] Failed to create collection:', {
					base: collection.base,
					reason: result.error,
				});
			}
		}

		return createdCount;
	};
}
