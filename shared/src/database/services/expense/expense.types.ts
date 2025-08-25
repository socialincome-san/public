import { Expense as PrismaExpense } from '@prisma/client';

export type CreateExpenseInput = Omit<PrismaExpense, 'id' | 'createdAt' | 'updatedAt'>;

export type ExpenseTableViewRow = {
	id: string;
	type: string;
	year: number;
	amountChf: number;
	readonly: boolean;
};

export type ExpenseTableView = {
	tableRows: ExpenseTableViewRow[];
};
