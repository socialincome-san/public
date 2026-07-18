import { MessagingJobsTable } from '@/app/portal/messaging/log/messaging-jobs-table';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { listMessagingJobsAction } from '@/lib/server-actions/messaging-actions';
import type { SearchParamsPageProps } from '@/lib/types/page-props';
import { Suspense } from 'react';

const PAGE_SIZE = 10;

export default function MessagingLogPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MessagingLogDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const MessagingLogDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);

	const resolvedSearchParams = await searchParams;
	const rawPage = Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page;
	const page = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1);

	const result = await listMessagingJobsAction({ page, pageSize: PAGE_SIZE });

	return (
		<MessagingJobsTable
			rows={result.success ? result.data.rows : []}
			error={result.success ? null : result.error}
			page={page}
			pageSize={PAGE_SIZE}
			totalCount={result.success ? result.data.totalCount : 0}
		/>
	);
};
