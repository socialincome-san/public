'use client';

import { ActionCell } from '@/components/data-table/elements/action-cell';
import { CurrencyCell } from '@/components/data-table/elements/currency-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ExpenseTableViewRow } from '@/lib/services/expense/expense.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeExpenseColumns = (): ColumnDef<ExpenseTableViewRow>[] => {
	return [
		{
			accessorKey: 'type',
			header: (ctx) => <SortableHeader ctx={ctx}>Type</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'year',
			header: (ctx) => <SortableHeader ctx={ctx}>Year</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'amountChf',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount</SortableHeader>,
			accessorFn: (row) => row.amountChf,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency="CHF" />,
		},
		{
			accessorKey: 'organizationName',
			header: (ctx) => <SortableHeader ctx={ctx}>Organization</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			cell: (ctx) => <ActionCell ctx={ctx} />,
		},
	];
}
