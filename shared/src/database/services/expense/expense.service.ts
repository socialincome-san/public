import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserService } from '../user/user.service';
import {
	ExpenseCreateInput,
	ExpensePayload,
	ExpenseTableView,
	ExpenseTableViewRow,
	ExpenseUpdateInput,
} from './expense.types';

export class ExpenseService extends BaseService {
	private userService = new UserService();

	async create(userId: string, input: ExpenseCreateInput): Promise<ServiceResult<ExpensePayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const created = await this.db.expense.create({
				data: input,
				include: { organization: { select: { id: true, name: true } } },
			});

			return this.resultOk({
				id: created.id,
				type: created.type,
				year: created.year,
				amountChf: Number(created.amountChf),
				organization: created.organization,
			});
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not create expense');
		}
	}

	async update(userId: string, input: ExpenseUpdateInput): Promise<ServiceResult<ExpensePayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const updated = await this.db.expense.update({
				where: { id: input.id },
				data: input,
				include: { organization: { select: { id: true, name: true } } },
			});

			return this.resultOk({
				id: updated.id,
				type: updated.type,
				year: updated.year,
				amountChf: Number(updated.amountChf),
				organization: updated.organization,
			});
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not update expense');
		}
	}

	async get(userId: string, expenseId: string): Promise<ServiceResult<ExpensePayload>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const expense = await this.db.expense.findUnique({
				where: { id: expenseId },
				include: { organization: { select: { id: true, name: true } } },
			});

			if (!expense) {
				return this.resultFail('Could not get expense');
			}

			return this.resultOk({
				id: expense.id,
				type: expense.type,
				year: expense.year,
				amountChf: Number(expense.amountChf),
				organization: expense.organization,
			});
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not get expense');
		}
	}

	async getTableView(userId: string): Promise<ServiceResult<ExpenseTableView>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
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
			}));

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch expenses');
		}
	}
}
