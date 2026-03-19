'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { DaysCountCell } from '@/components/data-table/elements/days-count-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { UpcomingOnboardingTableViewRow } from '@/lib/services/recipient/recipient.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeUpcomingOnboardingColumns = (): ColumnDef<UpcomingOnboardingTableViewRow>[] => [
	{
		accessorKey: 'recipientName',
		header: (ctx) => <SortableHeader ctx={ctx}>Recipient</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'programName',
		header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'daysUntilStart',
		header: (ctx) => <SortableHeader ctx={ctx}>Starts in</SortableHeader>,
		cell: (ctx) => <DaysCountCell ctx={ctx} />,
	},
	{
		accessorKey: 'startDate',
		header: (ctx) => <SortableHeader ctx={ctx}>Start date</SortableHeader>,
		cell: (ctx) => <DateCell ctx={ctx} />,
	},
	{
		accessorKey: 'createdAt',
		header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
		cell: (ctx) => <DateCell ctx={ctx} />,
	},
];
