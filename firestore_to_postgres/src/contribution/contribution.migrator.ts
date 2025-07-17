import { BaseMigrator } from '../core/base.migrator';
import { ContributionsExtractor } from './contribution.extractor';
import { ContributionsImporter } from './contribution.importer';
import { ContributionsTransformer } from './contribution.transformer';

export class ContributionMigrator extends BaseMigrator {
	private readonly extractor = new ContributionsExtractor();
	private readonly transformer = new ContributionsTransformer();
	private readonly importer = new ContributionsImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting contributions migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} contribution records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed[0].contributions.length} contribution records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} contribution records`);

		return insertedCount;
	}
}
