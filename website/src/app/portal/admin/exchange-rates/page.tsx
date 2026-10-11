import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedExchangeRateTableView } from '@/modules/exchange-rates/exchange-rate.service';
import type { ExchangeRatesTableViewRow } from '@/modules/exchange-rates/exchange-rate.types';
import { requireAdmin } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import ExchangeRatesTable from './exchange-rates-table';

export default function ExchangeRatesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ExchangeRatesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const ExchangeRatesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireAdmin();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedExchangeRateTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: ExchangeRatesTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const currencyFilterOptions = result.success ? result.data.currencyFilterOptions : [];

	return (
		<ExchangeRatesTable
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			currencyFilterOptions={currencyFilterOptions}
		/>
	);
};
