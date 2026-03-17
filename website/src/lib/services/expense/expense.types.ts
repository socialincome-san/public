import { ExpenseType } from '@/generated/prisma/client';

export type ExpenseTableViewRow = {
	id: string;
	type: ExpenseType;
	year: number;
	amountChf: number;
	organizationName: string;
	createdAt: Date;
};

export type ExpenseTableQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
};

export type ExpensePaginatedTableView = {
	tableRows: ExpenseTableViewRow[];
	totalCount: number;
};

export type ExpensePayload = {
	id: string;
	type: ExpenseType;
	year: number;
	amountChf: number;
	organization: { id: string; name: string };
};
