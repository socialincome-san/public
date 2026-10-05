import type { SearchParamsPageProps } from '@/app/page-props';
import { MessagingJobsTable } from '@/app/portal/messaging/delivery-log/messaging-jobs-table';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { listMessagingJobsAction } from '@/modules/messaging/messaging.actions';
import { requireAdmin } from '@/server/session';
import { Suspense } from 'react';

const PAGE_SIZE = 10;

export default function MessagingDeliveryLogPage({ searchParams }: SearchParamsPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MessagingDeliveryLogDataLoader searchParams={searchParams} />
		</Suspense>
	);
}

const MessagingDeliveryLogDataLoader = async ({ searchParams }: SearchParamsPageProps) => {
	await requireAdmin();

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
