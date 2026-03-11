'use client';

import { ActionCell } from '@/components/data-table/elements/action-cell';
import { CountryFlagCell } from '@/components/data-table/elements/country-flag-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ContributorTableViewRow } from '@/lib/services/contributor/contributor.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeContributorColumns = (): ColumnDef<ContributorTableViewRow>[] => {
	return [
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
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			enableHiding: false,
			cell: (ctx) => <ActionCell ctx={ctx} />,
		},
	];
};
