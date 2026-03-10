import { ExpenseType, Prisma, PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { UserReadService } from '../user/user-read.service';
import { ExpensePaginatedTableView, ExpensePayload, ExpenseTableQuery, ExpenseTableViewRow } from './expense.types';

export class ExpenseReadService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly userService: UserReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

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
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

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
		try {
			const isAdminResult = await this.userService.isAdmin(userId);

			if (!isAdminResult.success) {
				return this.resultFail(isAdminResult.error);
			}

			const search = query.search.trim();
			const matchedExpenseType = Object.values(ExpenseType).find((type) => type.toLowerCase() === search.toLowerCase());
			const parsedYear = Number(search);
			const hasYearFilter = search.length > 0 && Number.isInteger(parsedYear);
			const where = search
				? {
						OR: [
							{ id: { contains: search, mode: 'insensitive' as const } },
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
