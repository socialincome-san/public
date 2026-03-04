'use client';

import { ActionCell } from '@/components/data-table/elements/action-cell';
import { AgeCell } from '@/components/data-table/elements/age-cell';
import { CountryFlagCell } from '@/components/data-table/elements/country-flag-cell';
import { GenderCell } from '@/components/data-table/elements/gender-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeCandidateColumns = (
	hideProgramName = false,
	hideLocalPartner = false,
): ColumnDef<CandidatesTableViewRow>[] => {
	const columns: ColumnDef<CandidatesTableViewRow>[] = [
		{
			id: 'flag',
			header: (ctx) => <SortableHeader ctx={ctx}>Flag</SortableHeader>,
			accessorFn: (row) => row.country ?? '',
			cell: ({ row }) => <CountryFlagCell country={row.original.country} />,
		},
		{
			accessorKey: 'firstName',
			header: (ctx) => <SortableHeader ctx={ctx}>First name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'lastName',
			header: (ctx) => <SortableHeader ctx={ctx}>Last name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'gender',
			header: (ctx) => <SortableHeader ctx={ctx}>Gender</SortableHeader>,
			cell: (ctx) => <GenderCell ctx={ctx} />,
		},
		{
			accessorKey: 'dateOfBirth',
			header: (ctx) => <SortableHeader ctx={ctx}>Age</SortableHeader>,
			cell: (ctx) => <AgeCell ctx={ctx} />,
		},
		{
			accessorKey: 'contactNumber',
			header: (ctx) => <SortableHeader ctx={ctx}>Contact number</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
	];

	if (!hideLocalPartner) {
		columns.push({
			accessorKey: 'localPartnerName',
			header: (ctx) => <SortableHeader ctx={ctx}>Local Partner</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push({
		id: 'actions',
		header: '',
		enableSorting: false,
		cell: (ctx) => <ActionCell ctx={ctx} />,
	});

	return columns;
};
