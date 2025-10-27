'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { DateCell } from '@/app/portal/components/data-table/elements/date-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { ExpenseTableViewRow } from '@socialincome/shared/src/database/services/expense/expense.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeExpenseColumns(): ColumnDef<ExpenseTableViewRow>[] {
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
			accessorKey: 'amountChf',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount (CHF)</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
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
