'use client';

import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { ColumnDef } from '@/components/data-table/tanstack-table';
import type { OrganizationMemberTableViewRow } from '@/modules/organizations/organization.types';
import { DataTableRowChevronCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';

export const makeOrganizationMemberColumns = (showActions = false): ColumnDef<OrganizationMemberTableViewRow>[] => {
	const columns: ColumnDef<OrganizationMemberTableViewRow>[] = [
		{
			id: 'member',
			accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
			header: (ctx) => <SortableHeader ctx={ctx}>Member</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'email',
			header: (ctx) => <SortableHeader ctx={ctx}>Email</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
	];

	if (showActions) {
		columns.push({
			id: 'actions',
			header: '',
			enableHiding: false,
			cell: () => <DataTableRowChevronCell />,
		});
	}

	return columns;
};
