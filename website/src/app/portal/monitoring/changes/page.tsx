import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getChangeTableView } from '@/modules/changes/change.service';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import { ChangesTableClient } from './changes-table-client';

export default function ChangesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<ChangesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const ChangesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireSession('user');
	const tableQuery = tableQueryFromSearchParams(await searchParams);
	const result = await getChangeTableView(user.id, tableQuery);
	const view = result.success ? result.data : { tableRows: [], totalCount: 0, entityTypeFilterOptions: [] };

	return (
		<ChangesTableClient
			view={view}
			error={result.success ? null : result.error}
			query={{ ...tableQuery, totalRows: view.totalCount }}
		/>
	);
};
