import { makePayoutForecastColumns } from '@/components/data-table/columns/payout-forecast';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { PayoutForecastTableViewRow } from '@/lib/services/payout/payout.types';

export const payoutForecastTableConfig: DataTableConfig<PayoutForecastTableViewRow> = {
	id: 'payout-forecast',
	title: 'Payout Forecast',
	emptyMessage: 'No payout forecast found',
	searchKeys: ['period'],
	sortOptions: [
		{ id: 'period', label: 'Period' },
		{ id: 'numberOfRecipients', label: 'Recipients' },
		{ id: 'amountInProgramCurrency', label: 'Amount (program currency)' },
		{ id: 'amountUsd', label: 'Amount (USD)' },
	],
	makeColumns: makePayoutForecastColumns,
	showColumnVisibilitySelector: true,
	showEntityIdColumn: false,
};
