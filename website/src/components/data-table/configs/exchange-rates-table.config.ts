import { makeExchangeRatesColumns } from '@/components/data-table/columns/exchange-rates';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { ExchangeRatesTableViewRow } from '@/lib/services/exchange-rate/exchange-rate.types';

type ExchangeRatesFilterArgs = {
	query?: TableQueryState & { totalRows: number };
	currencyFilterOptions: {
		value: string;
		label: string;
	}[];
};

export const exchangeRatesTableConfig: DataTableConfig<ExchangeRatesTableViewRow> = {
	id: 'admin-exchange-rates',
	title: 'Exchange Rates for last month',
	emptyMessage: 'No exchange rates found',
	searchKeys: ['id', 'currency'],
	sortOptions: [
		{ id: 'currency', label: 'Currency' },
		{ id: 'rate', label: 'Rate' },
		{ id: 'timestamp', label: 'Timestamp' },
		{ id: 'createdAt', label: 'Imported' },
	],
	makeColumns: makeExchangeRatesColumns,
	showColumnVisibilitySelector: true,
};

export const getExchangeRatesTableFilters = ({
	query,
	currencyFilterOptions,
}: ExchangeRatesFilterArgs): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	return [
		{
			id: 'currency',
			queryKey: 'currency',
			label: 'Currency',
			placeholder: 'All currencies',
			value: query.currency,
			options: currencyFilterOptions,
		},
	];
};
