'use client';

import { CountryFlagCell } from '@/components/data-table/elements/country-flag-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { ProgramTableViewRow } from '@/modules/programs/program.types';
import { DataTableRowChevronCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';

type ProgramColumnOptions = {
	hideCountry?: boolean;
	hideOwners?: boolean;
	hideOperators?: boolean;
	hideFocuses?: boolean;
};

export const makeProgramColumns = (options: ProgramColumnOptions = {}): ColumnDef<ProgramTableViewRow>[] => {
	const columns: ColumnDef<ProgramTableViewRow>[] = [
		{
			accessorKey: 'name',
			header: (ctx) => <SortableHeader ctx={ctx}>Name</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
	];

	if (!options.hideCountry) {
		columns.push({
			accessorKey: 'country',
			header: (ctx) => <SortableHeader ctx={ctx}>Country</SortableHeader>,
			cell: ({ row }) => <CountryFlagCell country={row.original.country} />,
		});
	}

	if (!options.hideOwners) {
		columns.push({
			accessorKey: 'ownerOrganizations',
			header: (ctx) => <SortableHeader ctx={ctx}>Owners</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	if (!options.hideOperators) {
		columns.push({
			accessorKey: 'operatorOrganizations',
			header: (ctx) => <SortableHeader ctx={ctx}>Operators</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	if (!options.hideFocuses) {
		columns.push({
			accessorKey: 'focuses',
			header: (ctx) => <SortableHeader ctx={ctx}>Focuses</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		});
	}

	columns.push(
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
			enableHiding: false,
			cell: () => <DataTableRowChevronCell />,
		},
	);

	return columns;
};
