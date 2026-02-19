'use client';

import { DateCell } from '@/components/data-table/elements/date-cell';
import { SortableHeader } from '@/components/data-table/elements/sortable-header';
import { TextCell } from '@/components/data-table/elements/text-cell';
import { ExchangeRatesTableViewRow } from '@/lib/services/exchange-rate/exchange-rate.types';
import type { ColumnDef } from '@tanstack/react-table';

export const makeExchangeRatesColumns = (): ColumnDef<ExchangeRatesTableViewRow>[] => {
	return [
		{
			accessorKey: 'currency',
			header: (ctx) => <SortableHeader ctx={ctx}>Currency</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'rate',
			header: (ctx) => <SortableHeader ctx={ctx}>Rate</SortableHeader>,
			cell: (ctx) => <TextCell ctx={ctx} />,
		},
		{
			accessorKey: 'timestamp',
			header: (ctx) => <SortableHeader ctx={ctx}>Timestamp</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
		{
			accessorKey: 'createdAt',
			header: (ctx) => <SortableHeader ctx={ctx}>Imported</SortableHeader>,
			cell: (ctx) => <DateCell ctx={ctx} />,
		},
	];
};
