'use client';

import { StatusBadge } from '@/app/portal/components/custom/status-badge';
import { Button } from '@/app/portal/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/app/portal/components/ui/dropdown-menu';
import { RecipientStatus } from '@prisma/client';
import { RecipientTableFlatShape } from '@socialincome/shared/src/database/services/recipient/recipient.types';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

export const recipientColumns: ColumnDef<RecipientTableFlatShape>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
		cell: ({ getValue }) => <code className="text-xs">{String(getValue())}</code>,
		enableSorting: false,
	},
	{
		accessorKey: 'firstName',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				First name
				<ArrowUpDown className="ml-2 h-4 w-4" focusable="false" />
			</Button>
		),
	},
	{
		accessorKey: 'lastName',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				Last name
				<ArrowUpDown className="ml-2 h-4 w-4" focusable="false" />
			</Button>
		),
	},
	{
		accessorKey: 'age',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				Age
				<ArrowUpDown className="ml-2 h-4 w-4" focusable="false" />
			</Button>
		),
		cell: ({ getValue }) => {
			const v = getValue<number | null>();
			return <span>{v ?? '—'}</span>;
		},
	},
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				Status
				<ArrowUpDown className="ml-2 h-4 w-4" focusable="false" />
			</Button>
		),
		cell: ({ getValue }) => {
			const status = getValue<RecipientStatus>();
			return <StatusBadge status={status} />;
		},
	},
	{
		accessorKey: 'payoutsProgressPercent',
		header: 'Progress',
		cell: ({ row }) => {
			const { payoutsProgressPercent, payoutsReceived, payoutsTotal } = row.original as RecipientTableFlatShape;
			return (
				<div>
					<progress value={payoutsProgressPercent} max={100}></progress>
					<div>
						{payoutsReceived} / {payoutsTotal}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: 'localPartnerName',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				Local partner
				<ArrowUpDown className="ml-2 h-4 w-4" focusable="false" />
			</Button>
		),
	},
	{
		id: 'actions',
		cell: () => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" focusable="false" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem>Edit</DropdownMenuItem>
					<DropdownMenuItem>Delete</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];
