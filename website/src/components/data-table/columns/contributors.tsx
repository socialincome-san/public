'use client';

import { ActionCell } from '@/components/data-table/elements/action-cell';
import { CountryFlagCell } from '@/components/data-table/elements/country-flag-cell';
import { CurrencyCell } from '@/components/data-table/elements/currency-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { IdCell } from '@/components/data-table/elements/id-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { ProgramPermission } from '@/generated/prisma/enums';
import type { ContributorTableViewRow } from '@/lib/services/contributor/contributor.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeContributorColumns = (): ColumnDef<ContributorTableViewRow>[] => {
	return [
		{
			id: 'firebaseAuthUserId',
			accessorFn: (row) => row.firebaseAuthUserId,
			header: (ctx) => <SortableHeader ctx={ctx}>Firebase Auth User ID</SortableHeader>,
			cell: (ctx) => <IdCell ctx={ctx} />,
		},
		{
			id: 'contributor',
			accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
			header: (ctx) => <SortableHeader ctx={ctx}>Contributor</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'email',
			header: (ctx) => <SortableHeader ctx={ctx}>Email</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'country',
			header: (ctx) => <SortableHeader ctx={ctx}>Country</SortableHeader>,
			cell: (ctx) => <CountryFlagCell country={ctx.getValue() as ContributorTableViewRow['country']} />,
		},
		{
			id: 'totalContributedChf',
			accessorFn: (row) => row.totalContributedChf,
			header: (ctx) => <SortableHeader ctx={ctx}>Contributed (CHF)</SortableHeader>,
			cell: (ctx) => <CurrencyCell ctx={ctx} currency="CHF" />,
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
	];
};
