import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedCountryTableView } from '@/modules/countries/country.service';
import type { CountryTableViewRow } from '@/modules/countries/country.types';
import { requireAdmin } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
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
	const user = await requireAdmin();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedCountryTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: CountryTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <CountriesTable rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
