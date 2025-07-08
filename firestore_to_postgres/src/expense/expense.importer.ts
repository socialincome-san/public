import { ExpenseService } from '@socialincome/shared/src/database/services/expense/expense.service';
import { CreateExpenseInput } from '@socialincome/shared/src/database/services/expense/expense.types';
import { BaseImporter } from '../core/base.importer';

export class ExpenseImporter extends BaseImporter<CreateExpenseInput> {
	private readonly expenseService = new ExpenseService();

	import = async (expenses: CreateExpenseInput[]): Promise<number> => {
		let createdCount = 0;

		for (const expense of expenses) {
			const result = await this.expenseService.create(expense);

			if (result.success) {
				createdCount++;
			} else {
				console.warn('[ExpenseImporter] Skipped expense entry:', {
					year: expense.year,
					type: expense.type,
					reason: result.error,
				});
			}
		}

		return createdCount;
	};
}
