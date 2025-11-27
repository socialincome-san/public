import { BaseMigrator } from '../core/base.migrator';
import { RecipientExtractor } from './recipient.extractor';
import { RecipientImporter } from './recipient.importer';
import { RecipientTransformer } from './recipient.transformer';

export class RecipientMigrator extends BaseMigrator {
	private readonly extractor = new RecipientExtractor();
	private readonly transformer = new RecipientTransformer();
	private readonly importer = new RecipientImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting recipient migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} recipient records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} recipient records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} recipient records`);

		return insertedCount;
	}
}
