'use client';

import { Button } from '@/app/portal/components/ui/button';
import { PayoutForecastRow } from '@socialincome/shared/src/database/services/payout-forecast/payout-forecast.types';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const usdFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
const programAmountFormatter = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const periodFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });

export const payoutForecastColumns: ColumnDef<PayoutForecastRow>[] = [
	{
		accessorKey: 'period',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				Period
				<ArrowUpDown className="ml-2 h-4 w-4" focusable="false" />
			</Button>
		),
		cell: ({ getValue }) => {
			const date = getValue<Date>();
			return <span className="whitespace-nowrap">{periodFormatter.format(new Date(date))}</span>;
		},
	},
	{
		accessorKey: 'numberOfRecipients',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				Recipients
				<ArrowUpDown className="ml-2 h-4 w-4" focusable="false" />
			</Button>
		),
		cell: ({ getValue }) => <span>{numberFormatter.format(getValue<number>())}</span>,
	},
	{
		accessorKey: 'amountInProgramCurrency',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				Amount (program)
				<ArrowUpDown className="ml-2 h-4 w-4" focusable="false" />
			</Button>
		),
		cell: ({ getValue }) => <span>{programAmountFormatter.format(getValue<number>())}</span>,
	},
	{
		accessorKey: 'amountUsd',
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
				Amount (USD)
				<ArrowUpDown className="ml-2 h-4 w-4" focusable="false" />
			</Button>
		),
		cell: ({ getValue }) => <span>{usdFormatter.format(getValue<number>())}</span>,
	},
];
