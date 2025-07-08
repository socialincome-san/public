import { BaseMigrator } from '../core/base.migrator';
import { AdminsExtractor } from './admin.extractor';
import { AdminsImporter } from './admin.importer';
import { AdminsTransformer } from './admin.transformer';

export class AdminMigrator extends BaseMigrator {
	private readonly extractor = new AdminsExtractor();
	private readonly transformer = new AdminsTransformer();
	private readonly importer = new AdminsImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting admin users migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} admin user records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} admin user records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} admin user records`);

		return insertedCount;
	}
}
