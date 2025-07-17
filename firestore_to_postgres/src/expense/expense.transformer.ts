import { CreateExpenseInput } from '@socialincome/shared/src/database/services/expense/expense.types';
import { Expense } from '@socialincome/shared/src/types/expense';
import { BaseTransformer } from '../core/base.transformer';

export class ExpenseTransformer extends BaseTransformer<Expense, CreateExpenseInput> {
	transform = async (input: Expense[]): Promise<CreateExpenseInput[]> => {
		return input.map((entry): CreateExpenseInput => {
			return {
				type: entry.type,
				year: entry.year,
				amountChf: entry.amount_chf,
			};
		});
	};
}
