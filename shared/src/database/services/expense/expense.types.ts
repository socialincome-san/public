import { Expense, ExpenseType } from '@prisma/client';

export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;

export type ExpenseTableViewRow = {
	id: string;
	type: ExpenseType;
	year: number;
	amountChf: number;
	organizationName: string;
	readonly: boolean;
};

export type ExpenseTableView = {
	tableRows: ExpenseTableViewRow[];
};
