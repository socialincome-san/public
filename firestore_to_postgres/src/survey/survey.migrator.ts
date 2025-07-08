import { BaseMigrator } from '../core/base.migrator';
import { SurveyExtractor } from './survey.extractor';
import { SurveyImporter } from './survey.importer';
import { SurveyTransformer } from './survey.transformer';

export class SurveyMigrator extends BaseMigrator {
	private readonly extractor = new SurveyExtractor();
	private readonly transformer = new SurveyTransformer();
	private readonly importer = new SurveyImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting surveys migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} survey records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed[0].length} survey records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} survey records`);

		return insertedCount;
	}
}
