'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import {
	exchangeRatesTableConfig,
	getExchangeRatesTableFilters,
} from '@/components/data-table/configs/exchange-rates-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import { importExchangeRatesAction } from '@/modules/exchange-rates/exchange-rate.actions';
import type { ExchangeRatesTableViewRow } from '@/modules/exchange-rates/exchange-rate.types';
import { RefreshCwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
	const t = useTranslations('portal-admin');
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
			config={{
				...exchangeRatesTableConfig,
				title: t('table.exchangeRates'),
				emptyMessage: t('table.noExchangeRates'),
			}}
			titleInfoTooltip={t('table.exchangeRatesTooltip')}
			rows={rows}
			error={error ?? errorMessage}
			query={query}
			toolbarFilters={getExchangeRatesTableFilters({ query, currencyFilterOptions })}
			actionMenuItems={[
				{
					label: isLoading ? t('actions.importing') : t('actions.importLastMonth'),
					icon: <RefreshCwIcon />,
					disabled: isLoading,
					onSelect: triggerImport,
				},
			]}
		/>
	);
}
