import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { ExchangeRateReadService } from '@/lib/services/exchange-rate/exchange-rate-read.service';
import { ExchangeRatesTableViewRow } from '@/lib/services/exchange-rate/exchange-rate.types';
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
	await requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const service = new ExchangeRateReadService();
	const result = await service.getPaginatedTableView(user.id, tableQuery);

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
