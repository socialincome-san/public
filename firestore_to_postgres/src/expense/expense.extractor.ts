import { EXPENSES_FIRESTORE_PATH, Expense } from '@socialincome/shared/src/types/expense';
import { BaseExtractor } from '../core/base.extractor';

export class ExpenseExtractor extends BaseExtractor<Expense> {
	extract = async (): Promise<Expense[]> => {
		return await this.firestore.getAll<Expense>(EXPENSES_FIRESTORE_PATH);
	};
}
