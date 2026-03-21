'use client';

import { ActionCell } from '@/components/data-table/elements/action-cell';
import { AgeCell } from '@/components/data-table/elements/age-cell';
import { CountryFlagCell } from '@/components/data-table/elements/country-flag-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { IdCell } from '@/components/data-table/elements/id-cell';
import { ProgressCell } from '@/components/data-table/elements/progress-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { ProgramPermission } from '@/generated/prisma/enums';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeRecipientColumns = (
	hideProgramName = false,
	hideLocalPartner = false,
): ColumnDef<RecipientTableViewRow>[] => {
	const columns: ColumnDef<RecipientTableViewRow>[] = [
		{
			accessorKey: 'firebaseAuthUserId',
			header: 'Firebase Auth User ID',
			cell: (ctx) => <IdCell ctx={ctx} />,
		},
		{
			id: 'recipient',
			accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
			header: (ctx) => <SortableHeader ctx={ctx}>Recipient</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'country',
			accessorFn: (row) => row.country ?? '',
			header: (ctx) => <SortableHeader ctx={ctx}>Country</SortableHeader>,
			cell: ({ row }) => <CountryFlagCell country={row.original.country} />,
		},
		{
			id: 'status',
			accessorFn: (row) => row.status,
			header: (ctx) => <SortableHeader ctx={ctx}>Status</SortableHeader>,
			cell: (ctx) => <StatusCell ctx={ctx} variant="recipient" />,
		},
		{
			accessorKey: 'paymentCode',
			header: (ctx) => <SortableHeader ctx={ctx}>Payment code</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'dateOfBirth',
			header: (ctx) => <SortableHeader ctx={ctx}>Age</SortableHeader>,
			cell: (ctx) => <AgeCell ctx={ctx} />,
		},
	];

	if (!hideLocalPartner) {
		columns.push({
			accessorKey: 'localPartnerName',
			header: (ctx) => <SortableHeader ctx={ctx}>Local Partner</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	if (!hideProgramName) {
		columns.push({
			accessorKey: 'programName',
			header: (ctx) => <SortableHeader ctx={ctx}>Program</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push(
		{
			accessorKey: 'startDate',
			header: (ctx) => <SortableHeader ctx={ctx}>Start date</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'payoutsProgressPercent',
			header: (ctx) => <SortableHeader ctx={ctx}>Progress</SortableHeader>,
			cell: (ctx) => <ProgressCell ctx={ctx} />,
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
			cell: (ctx) => (
				<ActionCell ctx={ctx} mode={ctx.row.original.permission === ProgramPermission.operator ? 'edit' : 'view'} />
			),
		},
	);

	return columns;
};
