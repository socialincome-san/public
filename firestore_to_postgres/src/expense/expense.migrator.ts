import { BaseMigrator } from '../core/base.migrator';
import { ExpenseExtractor } from './expense.extractor';
import { ExpenseImporter } from './expense.importer';
import { ExpenseTransformer } from './expense.transformer';

export class ExpenseMigrator extends BaseMigrator {
	private readonly extractor = new ExpenseExtractor();
	private readonly transformer = new ExpenseTransformer();
	private readonly importer = new ExpenseImporter();

	async migrate(): Promise<number> {
		console.log('🚀 Starting expense migration...');

		const extracted = await this.extractor.extract();
		console.log(`📦 Extracted ${extracted.length} expense records`);

		const transformed = await this.transformer.transform(extracted);
		console.log(`🔁 Transformed ${transformed.length} expense records`);

		const insertedCount = await this.importer.import(transformed);
		console.log(`✅ Imported ${insertedCount} expense records`);

		return insertedCount;
	}
}
