import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ContributorReadService } from '@/lib/services/contributor/contributor-read.service';
import type { ContributorTableViewRow } from '@/lib/services/contributor/contributor.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import ContributorsTableClient from './contributors-table-client';

export default function ContributorsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ContributorsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const ContributorsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const service = new ContributorReadService();
	const result = await service.getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: ContributorTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const countryFilterOptions = result.success ? result.data.countryFilterOptions : [];

	return (
		<ContributorsTableClient
			rows={rows}
			error={error}
			query={{ ...tableQuery, totalRows }}
			countryFilterOptions={countryFilterOptions}
		/>
	);
};
