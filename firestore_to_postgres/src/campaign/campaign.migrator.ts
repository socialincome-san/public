import { BaseMigrator } from '../core/base.migrator';
import { CampaignsExtractor } from './campaign.extractor';
import { CampaignsImporter } from './campaign.importer';
import { CampaignsTransformer } from './campaign.transformer';

export class CampaignMigrator extends BaseMigrator {
	private readonly extractor = new CampaignsExtractor();
	private readonly transformer = new CampaignsTransformer();
	private readonly importer = new CampaignsImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting campaigns migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} campaign records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} campaign records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} campaign records`);

		return insertedCount;
	}
}
