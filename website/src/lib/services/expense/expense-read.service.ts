import { ExpenseType, Prisma } from '@/generated/prisma/client';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { ExpensePaginatedTableView, ExpensePayload, ExpenseTableQuery, ExpenseTableViewRow } from './expense.types';

export class ExpenseReadService extends BaseService {
	private userService = new UserReadService();

	private buildExpenseOrderBy(query: ExpenseTableQuery): Prisma.ExpenseOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, [
			'id',
			'type',
			'year',
			'amountChf',
			'organizationName',
			'createdAt',
		] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'type':
				return [{ type: direction }];
			case 'year':
				return [{ year: direction }];
			case 'amountChf':
				return [{ amountChf: direction }];
			case 'organizationName':
				return [{ organization: { name: direction } }];
			case 'createdAt':
				return [{ createdAt: direction }];
			default:
				return [{ year: 'desc' }, { type: 'asc' }];
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
			this.logger.error(error);
			return this.resultFail(`Could not get expense: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedTableView(
		userId: string,
		query: ExpenseTableQuery,
	): Promise<ServiceResult<ExpensePaginatedTableView>> {
		const isAdminResult = await this.userService.isAdmin(userId);

		if (!isAdminResult.success) {
			return this.resultFail(isAdminResult.error);
		}

		try {
			const search = query.search.trim();
			const matchedExpenseType = Object.values(ExpenseType).find((type) => type.toLowerCase() === search.toLowerCase());
			const parsedYear = Number(search);
			const hasYearFilter = search.length > 0 && Number.isInteger(parsedYear);
			const where = search
				? {
						OR: [
							...(matchedExpenseType ? [{ type: { equals: matchedExpenseType } }] : []),
							{ organization: { name: { contains: search, mode: 'insensitive' as const } } },
							...(hasYearFilter ? [{ year: parsedYear }] : []),
						],
					}
				: undefined;
			const [expenses, totalCount] = await Promise.all([
				this.db.expense.findMany({
					where,
					select: {
						id: true,
						type: true,
						year: true,
						amountChf: true,
						createdAt: true,
						organization: { select: { name: true } },
					},
					orderBy: this.buildExpenseOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.expense.count({ where }),
			]);

			const tableRows: ExpenseTableViewRow[] = expenses.map((expense) => ({
				id: expense.id,
				type: expense.type,
				year: expense.year,
				amountChf: Number(expense.amountChf),
				organizationName: expense.organization.name,
				createdAt: expense.createdAt,
			}));

			return this.resultOk({ tableRows, totalCount });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch expenses: ${JSON.stringify(error)}`);
		}
	}
}
