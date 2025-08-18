'use client';

import { ActionCell } from '@/app/portal/components/custom/data-table/elements/action-cell';
import { ProgressCell } from '@/app/portal/components/custom/data-table/elements/progress-cell';
import { SortableHeader } from '@/app/portal/components/custom/data-table/elements/sortable-header';
import { StatusCell } from '@/app/portal/components/custom/data-table/elements/status-cell';
import { TextCell } from '@/app/portal/components/custom/data-table/elements/text-cell';
import type { RecipientTableFlatShape } from '@socialincome/shared/src/database/services/recipient/recipient.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeRecipientColumns(readOnly: boolean): ColumnDef<RecipientTableFlatShape>[] {
	return [
		{ accessorKey: 'id', header: 'ID', cell: (ctx) => <TextCell ctx={ctx} /> },
		{
			accessorKey: 'firstName',
			header: (ctx) => <SortableHeader ctx={ctx}>First name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'lastName',
			header: (ctx) => <SortableHeader ctx={ctx}>Last name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'age',
			header: (ctx) => <SortableHeader ctx={ctx}>Age</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'status',
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <StatusCell ctx={ctx} />,
		},
		{
			accessorKey: 'payoutsProgressPercent',
			header: (ctx) => <SortableHeader ctx={ctx}>Progress</SortableHeader>,
			cell: (ctx) => <ProgressCell ctx={ctx} />,
		},
		{
			accessorKey: 'localPartnerName',
			header: (ctx) => <SortableHeader ctx={ctx}>Local partner</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'actions',
			header: 'Actions',
			enableSorting: false,
			cell: (ctx) => <ActionCell ctx={ctx} readOnly={readOnly} />,
		},
	];
}
