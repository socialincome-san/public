import { BaseMigrator } from '../core/base.migrator';
import { ContributorExtractor } from './contributor.extractor';
import { ContributorImporter } from './contributor.importer';
import { ContributorTransformer } from './contributor.transformer';

export class ContributorMigrator extends BaseMigrator {
	private readonly extractor = new ContributorExtractor();
	private readonly transformer = new ContributorTransformer();
	private readonly importer = new ContributorImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting contributor migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} contributor records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} contributor records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} contributor records`);

		return insertedCount;
	}
}
