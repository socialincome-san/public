import { BaseMigrator } from '../core/base.migrator';
import { LocalPartnersExtractor } from './local-partner.extractor';
import { LocalPartnersImporter } from './local-partner.importer';
import { LocalPartnersTransformer } from './local-partner.transformer';

export class LocalPartnerMigrator extends BaseMigrator {
	private readonly extractor = new LocalPartnersExtractor();
	private readonly transformer = new LocalPartnersTransformer();
	private readonly importer = new LocalPartnersImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting local partners migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} local partner records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} local partner records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} local partner records`);

		return extracted.length;
	}
}
