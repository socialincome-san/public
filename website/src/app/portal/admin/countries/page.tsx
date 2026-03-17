import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import type { CountryTableViewRow } from '@/lib/services/country/country.types';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import CountriesTable from './countries-table';

export default function CountriesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<CountriesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const CountriesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await services.read.country.getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: CountryTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <CountriesTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
