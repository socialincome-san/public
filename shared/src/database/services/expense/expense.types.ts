import { ExpenseType } from '@prisma/client';

export type ExpenseTableViewRow = {
	id: string;
	type: ExpenseType;
	year: number;
	amountChf: number;
	organizationName: string;
	createdAt: Date;
	readonly: boolean;
};

export type ExpenseTableView = {
	tableRows: ExpenseTableViewRow[];
};
