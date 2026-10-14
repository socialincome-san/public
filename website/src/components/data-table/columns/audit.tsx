'use client';

import {
	describeAuditEvent,
	getAuditActorName,
	getAuditChangeItems,
	getAuditEntityName,
	getAuditEntityTypeLabel,
	sourceLabels,
} from '@/components/audit/audit-summary';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { AuditTableViewRow } from '@/modules/audit/audit.types';
import { ChangeList } from '@socialincome/design-system/data-display/change-list/change-list';
import { DataTableTextCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';

const entityColumns: ColumnDef<AuditTableViewRow>[] = [
	{
		id: 'entityType',
		header: 'Type',
		cell: ({ row }) => <DataTableTextCell value={getAuditEntityTypeLabel(row.original)} />,
	},
	{
		id: 'entityName',
		header: 'Name',
		cell: ({ row }) => <DataTableTextCell value={getAuditEntityName(row.original)} />,
	},
];

export const makeAuditColumns = ({ hideEntity = false }: { hideEntity?: boolean } = {}): ColumnDef<AuditTableViewRow>[] => [
	{
		accessorKey: 'createdAt',
		header: 'Date',
		cell: (ctx) => <DateCell ctx={ctx} options={{ dateStyle: 'short', timeStyle: 'short' }} />,
	},
	...(hideEntity ? [] : entityColumns),
	{
		id: 'changes',
		header: 'Changes',
		cell: ({ row }) => {
			const description = describeAuditEvent(row.original);

			return description ? (
				<DataTableTextCell value={description} />
			) : (
				<ChangeList ariaLabel="Changes" items={getAuditChangeItems(row.original)} />
			);
		},
	},
	{
		id: 'actorName',
		header: 'Changed by',
		cell: ({ row }) => <DataTableTextCell value={getAuditActorName(row.original)} />,
	},
	{
		accessorKey: 'source',
		header: 'Source',
		cell: (ctx) => <TextCell ctx={ctx} translatedValue={sourceLabels[ctx.row.original.source]} />,
	},
];
