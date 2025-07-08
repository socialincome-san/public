import { Expense as PrismaExpense } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { CreateExpenseInput } from './expense.types';

export class ExpenseService extends BaseService {
	async create(input: CreateExpenseInput): Promise<ServiceResult<PrismaExpense>> {
		try {
			const expense = await this.db.expense.create({
				data: input,
			});

			return this.resultOk(expense);
		} catch (e) {
			console.error('[ExpenseService.create]', e);
			return this.resultFail('Could not create expense');
		}
	}
}
