import { makeExpenseColumns } from '@/components/data-table/columns/expenses';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { ExpenseTableViewRow } from '@/lib/services/expense/expense.types';

export const expensesTableConfig: DataTableConfig<ExpenseTableViewRow> = {
	id: 'admin-expenses',
	title: 'Expenses',
	emptyMessage: 'No expenses found',
	searchKeys: ['id', 'type', 'year', 'organizationName'],
	sortOptions: [
		{ id: 'type', label: 'Type' },
		{ id: 'year', label: 'Year' },
		{ id: 'amountChf', label: 'Amount' },
		{ id: 'organizationName', label: 'Organization' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeExpenseColumns,
	showColumnVisibilitySelector: true,
};
