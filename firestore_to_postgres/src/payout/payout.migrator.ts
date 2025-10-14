import { BaseMigrator } from '../core/base.migrator';
import { PayoutExtractor } from './payout.extractor';
import { PayoutImporter } from './payout.importer';
import { PayoutTransformer } from './payout.transformer';

export class PayoutMigrator extends BaseMigrator {
	private readonly extractor = new PayoutExtractor();
	private readonly transformer = new PayoutTransformer();
	private readonly importer = new PayoutImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting payout migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} payout records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} payout records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} payout records`);

		return insertedCount;
	}
}
