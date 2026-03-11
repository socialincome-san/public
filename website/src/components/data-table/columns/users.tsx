'use client';

import { ActionCell } from '@/components/data-table/elements/action-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import type { UserTableViewRow } from '@/lib/services/user/user.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeUserColumns = (): ColumnDef<UserTableViewRow>[] => {
	return [
		{
			id: 'user',
			accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
			header: (ctx) => <SortableHeader ctx={ctx}>User</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'email',
			header: (ctx) => <SortableHeader ctx={ctx}>Email</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'role',
			header: (ctx) => <SortableHeader ctx={ctx}>Role</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'organizationName',
			header: (ctx) => <SortableHeader ctx={ctx}>Organization</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Created</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} options={{ year: 'numeric', month: '2-digit', day: '2-digit' }} />,
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
