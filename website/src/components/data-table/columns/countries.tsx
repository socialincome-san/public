'use client';

import { CountryFlag } from '@/components/country-flag';
import { ActionCell } from '@/components/data-table/elements/action-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { CountryTableViewRow } from '@/lib/services/country/country.types';
import { getCountryNameByIsoCode } from '@/lib/services/country/iso-countries';
import type { ColumnDef } from '@tanstack/react-table';

export function makeCountryColumns(): ColumnDef<CountryTableViewRow>[] {
	return [
		{
			id: 'flag',
			header: (ctx) => <SortableHeader ctx={ctx}>Flag</SortableHeader>,
			accessorFn: (row) => row.isoCode,
			cell: ({ row }) => <CountryFlag country={row.original.isoCode} />,
		},
		{
			accessorKey: 'name',
			header: (ctx) => <SortableHeader ctx={ctx}>Name</SortableHeader>,
			accessorFn: (row) => getCountryNameByIsoCode(row.isoCode),
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'isActive',
			header: (ctx) => <SortableHeader ctx={ctx}>Active</SortableHeader>,
			accessorFn: (row) => row.isActive,
			cell: (ctx) => <StatusCell ctx={ctx} variant="boolean" />,
		},
		{
			id: 'microfinanceIndex',
			header: (ctx) => <SortableHeader ctx={ctx}>Microfinance Index</SortableHeader>,
			accessorFn: (row) => row.microfinanceIndex ?? '',
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'populationCoverage',
			header: (ctx) => <SortableHeader ctx={ctx}>Population Coverage %</SortableHeader>,
			accessorFn: (row) => row.populationCoverage ?? '',
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'networkTechnology',
			header: (ctx) => <SortableHeader ctx={ctx}>Network Technology</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'latestSurveyDate',
			header: (ctx) => <SortableHeader ctx={ctx}>Latest Survey</SortableHeader>,
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
			enableSorting: false,
			cell: (ctx) => <ActionCell ctx={ctx} />,
		},
	];
}
