import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedContributorTableView } from '@/modules/contributors/contributor.service';
import type { ContributorTableViewRow } from '@/modules/contributors/contributor.types';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
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
	const user = await requireSession('user');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedContributorTableView(user.id, tableQuery);

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
