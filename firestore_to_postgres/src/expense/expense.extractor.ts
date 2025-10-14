import { Expense } from '@socialincome/shared/src/types/expense';
import { BaseExtractor } from '../core/base.extractor';
import { EXPENSES_FIRESTORE_PATH, FirestoreExpense } from './expense.types';

export class ExpenseExtractor extends BaseExtractor<FirestoreExpense> {
	extract = async (): Promise<FirestoreExpense[]> => {
		const snapshot = await this.firestore.collection(EXPENSES_FIRESTORE_PATH).get();
		return snapshot.docs.map(
			(doc) => ({ ...(doc.data() as Expense), id: doc.id, legacyFirestoreId: doc.id }) as FirestoreExpense,
		);
	};
}
