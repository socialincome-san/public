import { Expense as PrismaExpense, UserRole } from '@prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserInformation } from '../user/user.types';
import { CreateExpenseInput, ExpenseTableView, ExpenseTableViewRow } from './expense.types';

export class ExpenseService extends BaseService {
	async create(input: CreateExpenseInput): Promise<ServiceResult<PrismaExpense>> {
		try {
			const expense = await this.db.expense.create({
				data: input,
			});

			return this.resultOk(expense);
		} catch (error) {
			return this.resultFail('Could not create expense');
		}
	}

	async getExpenseAdminTableView(user: UserInformation): Promise<ServiceResult<ExpenseTableView>> {
		if (user.role !== UserRole.admin) {
			return this.resultOk({ tableRows: [] });
		}

		try {
			const expenses = await this.db.expense.findMany({
				select: {
					id: true,
					type: true,
					year: true,
					amountChf: true,
					organization: { select: { name: true } },
				},
				orderBy: [{ year: 'desc' }, { type: 'asc' }],
			});

			const tableRows: ExpenseTableViewRow[] = expenses.map((expense) => ({
				id: expense.id,
				type: expense.type,
				year: expense.year,
				amountChf: Number(expense.amountChf),
				organizationName: expense.organization.name,
				readonly: user.role !== UserRole.admin,
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			return this.resultFail('Could not fetch expenses');
		}
	}
}
