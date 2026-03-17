import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { ExchangeRatesTableViewRow } from '@/lib/services/exchange-rate/exchange-rate.types';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
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
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await services.read.exchangeRate.getPaginatedTableView(user.id, tableQuery);

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
