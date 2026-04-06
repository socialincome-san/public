'use client';

import { Button } from '@/components/button';
import { AgeCell } from '@/components/data-table/elements/age-cell';
import { CountryFlagCell } from '@/components/data-table/elements/country-flag-cell';
import { DateCell } from '@/components/data-table/elements/date-cell';
import { IdCell } from '@/components/data-table/elements/id-cell';
import { ProgressCell } from '@/components/data-table/elements/progress-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { StatusCell } from '@/components/data-table/elements/status-cell';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dropdown-menu';
import { ProgramPermission } from '@/generated/prisma/enums';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, MoreHorizontalIcon, PenLineIcon, SendIcon } from 'lucide-react';
import { createContext, useContext } from 'react';

type RecipientTableCallbacks = {
	onEdit?: (row: RecipientTableViewRow) => void;
	onSendMessage?: (recipientId: string) => void;
};

export const RecipientTableCallbacksContext = createContext<RecipientTableCallbacks>({});

const RecipientActionCell = ({ row }: { row: RecipientTableViewRow }) => {
	const { onEdit, onSendMessage } = useContext(RecipientTableCallbacksContext);
	const isOperator = row.permission === ProgramPermission.operator;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
					<MoreHorizontalIcon className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onSelect={(e) => {
						e.stopPropagation();
						onEdit?.(row);
					}}
				>
					{isOperator ? <PenLineIcon className="mr-2 h-4 w-4" /> : <EyeIcon className="mr-2 h-4 w-4" />}
					{isOperator ? 'Edit' : 'View'}
				</DropdownMenuItem>
				{isOperator && onSendMessage && (
					<DropdownMenuItem
						onSelect={(e) => {
							e.stopPropagation();
							onSendMessage(row.id);
						}}
					>
						<SendIcon className="mr-2 h-4 w-4" />
						Send message
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

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
			cell: (ctx) => <RecipientActionCell row={ctx.row.original} />,
		},
	);

	return columns;
};
