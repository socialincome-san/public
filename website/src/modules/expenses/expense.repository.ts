import type { Prisma } from '@/generated/prisma/client';
import { ExpenseType } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { toSortKey } from '@/lib/utils/to-sort-key';
import type { ExpenseCreateInput, ExpenseUpdateInput } from './expense.schemas';
import type { ExpenseTableQuery } from './expense.types';

const expensePayloadSelect = {
	id: true,
	type: true,
	year: true,
	amountChf: true,
	organization: {
		select: {
			id: true,
			name: true,
		},
	},
} as const;

export const findExpenseById = async (expenseId: string) =>
	prisma.expense.findUnique({
		where: { id: expenseId },
		select: expensePayloadSelect,
	});

export const findPaginatedExpenses = async (query: ExpenseTableQuery) => {
	const search = query.search.trim();
	const matchedExpenseType = Object.values(ExpenseType).find((type) => type.toLowerCase() === search.toLowerCase());
	const parsedYear = Number(search);
	const hasYearFilter = search.length > 0 && Number.isInteger(parsedYear);
	const where: Prisma.ExpenseWhereInput | undefined = search
		? {
				OR: [
					{ id: { contains: search, mode: 'insensitive' } },
					...(matchedExpenseType ? [{ type: { equals: matchedExpenseType } }] : []),
					{
						organization: {
							name: { contains: search, mode: 'insensitive' },
						},
					},
					...(hasYearFilter ? [{ year: parsedYear }] : []),
				],
			}
		: undefined;
	const [expenses, totalCount] = await Promise.all([
		prisma.expense.findMany({
			where,
			select: {
				id: true,
				type: true,
				year: true,
				amountChf: true,
				createdAt: true,
				organization: { select: { name: true } },
			},
			orderBy: buildExpenseOrderBy(query),
			skip: (query.page - 1) * query.pageSize,
			take: query.pageSize,
		}),
		prisma.expense.count({ where }),
	]);

	return { expenses, totalCount };
};

export const createExpense = async (input: ExpenseCreateInput) =>
	prisma.expense.create({
		data: {
			type: input.type,
			year: input.year,
			amountChf: input.amountChf,
			organization: {
				connect: { id: input.organizationId },
			},
		},
		select: expensePayloadSelect,
	});

export const updateExpense = async (input: ExpenseUpdateInput) =>
	prisma.expense.update({
		where: { id: input.id },
		data: {
			type: input.type,
			year: input.year,
			amountChf: input.amountChf,
			organization: {
				connect: { id: input.organizationId },
			},
		},
		select: expensePayloadSelect,
	});

const buildExpenseOrderBy = (query: ExpenseTableQuery): Prisma.ExpenseOrderByWithRelationInput[] => {
	const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
	const sortBy = toSortKey(query.sortBy, ['id', 'type', 'year', 'amountChf', 'organizationName', 'createdAt'] as const);

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
};
