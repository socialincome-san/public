import { BaseMigrator } from '../core/base.migrator';
import { PayoutForecastExtractor } from './payout-forecast.extractor';
import { PayoutForecastImporter } from './payout-forecast.importer';
import { PayoutForecastTransformer } from './payout-forecast.transformer';

export class PayoutForecastMigrator extends BaseMigrator {
	private readonly extractor = new PayoutForecastExtractor();
	private readonly transformer = new PayoutForecastTransformer();
	private readonly importer = new PayoutForecastImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting payout forecast migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} payout forecast records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} payout forecast records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} payout forecast records`);

		return insertedCount;
	}
}
