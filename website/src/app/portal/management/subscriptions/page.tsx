import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import {
	EMPTY_SUBSCRIPTION_FILTER_OPTIONS,
	type SubscriptionTableViewRow,
} from '@/lib/services/subscription/subscription.types';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
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
	const user = await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await services.read.subscription.getPaginatedTableView(user.id, tableQuery);

	const error = result.success ? null : result.error;
	const rows: SubscriptionTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;
	const filterOptions = result.success ? result.data.filterOptions : EMPTY_SUBSCRIPTION_FILTER_OPTIONS;

	return (
		<SubscriptionsTableClient rows={rows} error={error} query={{ ...tableQuery, totalRows }} filterOptions={filterOptions} />
	);
};
