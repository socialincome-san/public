import { BaseMigrator } from '../core/base.migrator';
import { ContributionExtractor } from './contribution.extractor';
import { ContributionImporter } from './contribution.importer';
import { ContributionTransformer } from './contribution.transformer';

export class ContributionMigrator extends BaseMigrator {
	private readonly extractor = new ContributionExtractor();
	private readonly transformer = new ContributionTransformer();
	private readonly importer = new ContributionImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting contribution migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} contribution records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} contribution records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} contribution records`);

		return insertedCount;
	}
}
