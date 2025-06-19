import { BaseMigrator } from '../core/base.migrator';
import { RecipientsExtractor } from './recipient.extractor';
import { RecipientsImporter } from './recipient.importer';
import { RecipientsTransformer } from './recipient.transformer';

export class RecipientMigrator extends BaseMigrator {
	private readonly extractor = new RecipientsExtractor();
	private readonly transformer = new RecipientsTransformer();
	private readonly importer = new RecipientsImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting recipients migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} recipient records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} recipient records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} recipient records`);

		return insertedCount;
	}
}
