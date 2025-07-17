import { BaseMigrator } from '../core/base.migrator';
import { ExchangeRatesExtractor } from './exchange-rate.extractor';
import { ExchangeRatesImporter } from './exchange-rate.importer';
import { ExchangeRatesTransformer } from './exchange-rate.transformer';

export class ExchangeRateMigrator extends BaseMigrator {
	private readonly extractor = new ExchangeRatesExtractor();
	private readonly transformer = new ExchangeRatesTransformer();
	private readonly importer = new ExchangeRatesImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting exchange rates migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} exchange rate collections`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} exchange rate collections`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} exchange rate collections`);

		return insertedCount;
	}
}
