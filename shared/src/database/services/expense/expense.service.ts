import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserService } from '../user/user.service';
import { ExpenseTableView, ExpenseTableViewRow } from './expense.types';

export class ExpenseService extends BaseService {
	private userService = new UserService();

	async getTableView(userId: string): Promise<ServiceResult<ExpenseTableView>> {
		try {
			const isAdminResult = await this.userService.isAdmin(userId);
			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const isAdmin = isAdminResult.data;
			if (!isAdmin) {
				return this.resultOk({ tableRows: [] });
			}

			const expenses = await this.db.expense.findMany({
				select: {
					id: true,
					type: true,
					year: true,
					amountChf: true,
					createdAt: true,
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
				createdAt: expense.createdAt,
				readonly: !isAdmin,
			}));

			return this.resultOk({ tableRows });
		} catch {
			return this.resultFail('Could not fetch expenses');
		}
	}
}
