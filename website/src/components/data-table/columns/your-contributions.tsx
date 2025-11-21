'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { YourContributionsTableViewRow } from '@/lib/services/contribution/contribution.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makeYourContributionsColumns(): ColumnDef<YourContributionsTableViewRow>[] {
	return [
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'amount',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'currency',
			header: (ctx) => <SortableHeader ctx={ctx}>Currency</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'campaignTitle',
			header: (ctx) => <SortableHeader ctx={ctx}>Campaign</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
	];
}
