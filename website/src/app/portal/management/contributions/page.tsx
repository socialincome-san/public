import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedTableView } from '@/modules/contributions/contribution.service';
import { ContributionTableViewRow } from '@/modules/contributions/contribution.types';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import { ContributionsTableClient } from './contributions-table-client';

export default function ContributionsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ContributionsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const ContributionsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireSession('user');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: ContributionTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const filterOptions = result.success ? result.data.filterOptions : { programs: [], campaigns: [], paymentEventTypes: [] };

	return (
		<ContributionsTableClient rows={rows} error={error} query={{ ...tableQuery, totalRows }} filterOptions={filterOptions} />
	);
};
