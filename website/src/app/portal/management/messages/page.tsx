import { tableQueryFromSearchParams } from '@/components/data-table/query-state';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { MessageTableViewRow } from '@/lib/services/messaging/messaging-log.types';
import { services } from '@/lib/services/services';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';
import MessagesTableClient from './messages-table-client';

export default function MessagesPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MessagesDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const MessagesDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	await getAuthenticatedUserOrRedirect();
	const resolvedSearchParams = await searchParams;
	const tableQuery = tableQueryFromSearchParams(resolvedSearchParams);

	const result = await services.read.messageLog.getPaginatedTableView(tableQuery);

	const error = result.success ? null : result.error;
	const messageRows: MessageTableViewRow[] = result.success ? result.data.tableRows : [];
	const totalRows = result.success ? result.data.totalCount : 0;

	return <MessagesTableClient rows={messageRows} error={error} query={{ ...tableQuery, totalRows }} />;
};
