'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { DaysCountCell } from '@/components/data-table/elements/days-count-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { UpcomingOnboardingTableViewRow } from '@/modules/recipients/recipient.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { DataTableRowChevronCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import { PencilIcon } from 'lucide-react';

export const makeUpcomingOnboardingColumns = (
	onEdit?: (row: UpcomingOnboardingTableViewRow) => void,
): ColumnDef<UpcomingOnboardingTableViewRow>[] => [
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
		accessorKey: 'localPartnerName',
		header: (ctx) => <SortableHeader ctx={ctx}>Local Partner</SortableHeader>,
		cell: (ctx) => <TextCell ctx={ctx} />,
	},
	{
		accessorKey: 'communicationPhoneNumber',
		header: (ctx) => <SortableHeader ctx={ctx}>Communication Phone</SortableHeader>,
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
	{
		id: 'actions',
		header: '',
		enableHiding: false,
		cell: ({ row }) =>
			onEdit ? (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={`Edit ${row.original.recipientName}`}
					onClick={(event) => {
						event.stopPropagation();
						onEdit(row.original);
					}}
				>
					<PencilIcon />
				</Button>
			) : (
				<DataTableRowChevronCell />
			),
	},
];
