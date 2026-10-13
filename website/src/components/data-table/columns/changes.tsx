'use client';

import { describeChange, getChangeItems, sourceLabels } from '@/components/changes/change-summary';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { ChangeTableViewRow } from '@/modules/changes/change.types';
import { ChangeList } from '@socialincome/design-system/data-display/change-list/change-list';
import { DataTableTextCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';

export const makeChangeColumns = (): ColumnDef<ChangeTableViewRow>[] => [
	{
		accessorKey: 'createdAt',
		header: 'Date',
		cell: (ctx) => <DateCell ctx={ctx} options={{ dateStyle: 'short', timeStyle: 'short' }} />,
	},
	{
		accessorKey: 'entityTypeLabel',
		header: 'Type',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'entityName',
		header: 'Name',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'context',
		header: 'Context',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		id: 'changes',
		header: 'Changes',
		cell: ({ row }) => {
			const description = describeChange(row.original);

			return description ? (
				<DataTableTextCell value={description} />
			) : (
				<ChangeList ariaLabel="Changes" items={getChangeItems(row.original)} />
			);
		},
	},
	{
		accessorKey: 'actorName',
		header: 'Changed by',
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'source',
		header: 'Source',
		cell: (ctx) => <TextCell ctx={ctx} translatedValue={sourceLabels[ctx.row.original.source]} />,
	},
];
