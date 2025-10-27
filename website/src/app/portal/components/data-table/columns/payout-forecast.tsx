'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import { PayoutForecastTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import type { ColumnDef } from '@tanstack/react-table';

export function makePayoutForecastColumns(): ColumnDef<PayoutForecastTableViewRow>[] {
	return [
		{
			accessorKey: 'period',
			header: (ctx) => <SortableHeader ctx={ctx}>Period</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'numberOfRecipients',
			header: (ctx) => <SortableHeader ctx={ctx}>Recipients</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'amountInProgramCurrency',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount (Program Currency)</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'amountUsd',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount (USD)</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			id: 'actions',
			header: '',
			enableSorting: false,
			cell: (ctx) => <ActionCell ctx={ctx} />,
		},
	];
}
