'use client';

import { ActionCell } from '@/components/data-table/elements/action-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { FocusTableViewRow } from '@/modules/focuses/focus.types';

export const makeFocusColumns = (): ColumnDef<FocusTableViewRow>[] => [
	{
		accessorKey: 'name',
		header: (ctx) => <SortableHeader ctx={ctx}>Name</SortableHeader>,
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
		enableHiding: false,
		cell: (ctx) => <ActionCell ctx={ctx} />,
	},
];
