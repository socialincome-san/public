import type { SearchParamsPageProps } from '@/app/page-props';
import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { getPaginatedTableView } from '@/modules/subscriptions/subscription.service';
import { type SubscriptionTableViewRow } from '@/modules/subscriptions/subscription.types';
import { requireSession } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Suspense } from 'react';
import { SubscriptionsTableClient } from './subscriptions-table-client';

export default function SubscriptionsPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<SubscriptionsDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const SubscriptionsDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await requireSession('user');
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: SubscriptionTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <SubscriptionsTableClient rows={rows} error={error} query={{ ...tableQuery, totalRows }} />;
};
