import { BaseMigrator } from '../core/base.migrator';
import { CampaignExtractor } from './campaign.extractor';
import { CampaignImporter } from './campaign.importer';
import { CampaignTransformer } from './campaign.transformer';

export class CampaignMigrator extends BaseMigrator {
	private readonly extractor = new CampaignExtractor();
	private readonly transformer = new CampaignTransformer();
	private readonly importer = new CampaignImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting campaign migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} campaign records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} campaign records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} campaign records`);

		return insertedCount;
	}
}
