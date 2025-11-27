import { BaseMigrator } from '../core/base.migrator';
import { ExchangeRateExtractor } from './exchange-rate.extractor';
import { ExchangeRateImporter } from './exchange-rate.importer';
import { ExchangeRateTransformer } from './exchange-rate.transformer';

export class ExchangeRateMigrator extends BaseMigrator {
	private readonly extractor = new ExchangeRateExtractor();
	private readonly transformer = new ExchangeRateTransformer();
	private readonly importer = new ExchangeRateImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting exchange rate migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} exchange rate entries`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} exchange rate records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} exchange rate records`);

		return insertedCount;
	}
}
