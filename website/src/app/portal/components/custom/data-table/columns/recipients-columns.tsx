'use client';

import { ActionCell } from '@/app/portal/components/custom/data-table/columns/helper/action-cell';
import { ProgressCell } from '@/app/portal/components/custom/data-table/columns/helper/progress-cell';
import { SortableHeader } from '@/app/portal/components/custom/data-table/columns/helper/sortable-header';
import { StatusCell } from '@/app/portal/components/custom/data-table/columns/helper/status-cell';
import { TextCell } from '@/app/portal/components/custom/data-table/columns/helper/text-cell';
import type { RecipientTableFlatShape } from '@socialincome/shared/src/database/services/recipient/recipient.types';
import type { ColumnDef } from '@tanstack/react-table';

export const recipientColumns: ColumnDef<RecipientTableFlatShape>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
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
		cell: (ctx) => <ActionCell ctx={ctx} />,
	},
];
