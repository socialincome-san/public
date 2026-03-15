'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	exchangeRatesTableConfig,
	getExchangeRatesTableFilters,
} from '@/components/data-table/configs/exchange-rates-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import { importExchangeRatesAction } from '@/lib/server-actions/exchange-rates-actions';
import { ExchangeRatesTableViewRow } from '@/lib/services/exchange-rate/exchange-rate.types';
import { RefreshCwIcon } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function ExchangeRatesTable({
	rows,
	error,
	query,
	currencyFilterOptions,
}: {
	rows: ExchangeRatesTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
	currencyFilterOptions: { value: string; label: string }[];
}) {
	const [isLoading, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const triggerImport = () => {
		setErrorMessage(null);
		startTransition(async () => {
			const result = await importExchangeRatesAction();
			if (!result.success) {
				setErrorMessage(result.error);
			}
		});
	};

	return (
		<ConfiguredDataTableClient
			config={exchangeRatesTableConfig}
			titleInfoTooltip="Shows imported monthly exchange-rate snapshots."
			rows={rows}
			error={error || errorMessage}
			query={query}
			toolbarFilters={getExchangeRatesTableFilters({ query, currencyFilterOptions })}
			actionMenuItems={[
				{
					label: isLoading ? 'Importing...' : 'Import last month',
					icon: <RefreshCwIcon />,
					disabled: isLoading,
					onSelect: triggerImport,
				},
			]}
		/>
	);
}
