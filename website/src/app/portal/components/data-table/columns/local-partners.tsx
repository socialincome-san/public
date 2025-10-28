'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { DateCell } from '@/app/portal/components/data-table/elements/date-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { LocalPartnerTableViewRow } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeLocalPartnerColumns(): ColumnDef<LocalPartnerTableViewRow>[] {
	return [
		{
			accessorKey: 'name',
			header: (ctx) => <SortableHeader ctx={ctx}>Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'contactPerson',
			header: (ctx) => <SortableHeader ctx={ctx}>Contact Person</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'contactNumber',
			header: (ctx) => <SortableHeader ctx={ctx}>Contact Number</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'recipientsCount',
			header: (ctx) => <SortableHeader ctx={ctx}>Recipients</SortableHeader>,
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
