import { BaseMigrator } from '../core/base.migrator';
import { UsersExtractor } from './user.extractor';
import { UsersImporter } from './user.importer';
import { UsersTransformer } from './user.transformer';

export class UserMigrator extends BaseMigrator {
	private readonly extractor = new UsersExtractor();
	private readonly transformer = new UsersTransformer();
	private readonly importer = new UsersImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting users migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} user records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} user records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} user records`);

		return insertedCount;
	}
}
