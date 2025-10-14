import { BaseMigrator } from '../core/base.migrator';
import { LocalPartnerExtractor } from './local-partner.extractor';
import { LocalPartnerImporter } from './local-partner.importer';
import { LocalPartnerTransformer } from './local-partner.transformer';

export class LocalPartnerMigrator extends BaseMigrator {
	private readonly extractor = new LocalPartnerExtractor();
	private readonly transformer = new LocalPartnerTransformer();
	private readonly importer = new LocalPartnerImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting local partner migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} local partner records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} local partner records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} local partner records`);

		return insertedCount;
	}
}
