'use client';

import { ActionCell } from '@/app/portal/components/data-table/elements/action-cell';
import { SortableHeader } from '@/app/portal/components/data-table/elements/sortable-header';
import { TextCell } from '@/app/portal/components/data-table/elements/text-cell';
import type { PayoutForecastTableViewRow } from '@socialincome/shared/src/database/services/payout-forecast/payout-forecast.types';
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
			header: (ctx) => <SortableHeader ctx={ctx}>Number of Recipients</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'amountInProgramCurrency',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount in Program Currency</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'amountUsd',
			header: (ctx) => <SortableHeader ctx={ctx}>Amount in USD</SortableHeader>,
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
