import { BaseMigrator } from '../core/base.migrator';
import { PayoutsExtractor } from './payout.extractor';
import { PayoutsImporter } from './payout.importer';
import { PayoutsTransformer } from './payout.transformer';

export class PayoutMigrator extends BaseMigrator {
	private readonly extractor = new PayoutsExtractor();
	private readonly transformer = new PayoutsTransformer();
	private readonly importer = new PayoutsImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting payouts migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} payout records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed[0].length} payout records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} payout records`);

		return insertedCount;
	}
}
