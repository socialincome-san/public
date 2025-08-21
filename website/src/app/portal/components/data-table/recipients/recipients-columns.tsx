'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { ProgressCell } from '@/app/portal/components/data-table/elements/progress-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { RecipientStatusCell } from '@/app/portal/components/data-table/elements/status-cells/recipient-status-cell';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { RecipientTableViewRow } from '@socialincome/shared/src/database/services/recipient/recipient.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeRecipientColumns(showProgramName?: boolean): ColumnDef<RecipientTableViewRow>[] {
	const columns: ColumnDef<RecipientTableViewRow>[] = [
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
			cell: (ctx) => <RecipientStatusCell ctx={ctx} />,
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
	];

	if (showProgramName) {
		columns.push({
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push({
		id: 'actions',
		header: 'Actions',
		enableSorting: false,
		cell: (ctx) => {
			const row = ctx.row.original;
			return <ActionCell ctx={ctx} readOnly={row.permission !== 'operator'} />;
		},
	});

	return columns;
}
