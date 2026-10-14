import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getAuditTableView } from '@/modules/audit/audit.service';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import { AuditTableClient } from './audit-table-client';

export default function AuditPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<AuditDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const AuditDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireSession('user');
	const tableQuery = tableQueryFromSearchParams(await searchParams);
	const result = await getAuditTableView(user.id, tableQuery);
	const view = result.success ? result.data : { tableRows: [], totalCount: 0, entityTypeFilterOptions: [] };

	return (
		<AuditTableClient
			view={view}
			error={result.success ? null : result.error}
			query={{ ...tableQuery, totalRows: view.totalCount }}
		/>
	);
};
