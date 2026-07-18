import { MessagingJobMessagesTable } from '@/app/portal/messaging/log/[jobId]/messaging-job-messages-table';
import { MessagingJobSummaryCard } from '@/app/portal/messaging/log/[jobId]/messaging-job-summary-card';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { getMessagingJobDetailAction } from '@/lib/server-actions/messaging-actions';
import { Suspense } from 'react';

const MESSAGES_PAGE_SIZE = 25;

type Params = { jobId: string };
type SearchParams = { msgPage?: string | string[] };

type PageProps = {
	params: Promise<Params>;
	searchParams: Promise<SearchParams>;
};

export default function MessagingJobDetailPage(props: PageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<JobDetailDataLoader {...props} />
		</Suspense>
	);
}

const JobDetailDataLoader = async ({ params, searchParams }: PageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);

	const { jobId } = await params;
	const resolvedSearchParams = await searchParams;
	const rawPage = Array.isArray(resolvedSearchParams.msgPage)
		? resolvedSearchParams.msgPage[0]
		: resolvedSearchParams.msgPage;
	const msgPage = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1);

	const result = await getMessagingJobDetailAction(jobId, { page: msgPage, pageSize: MESSAGES_PAGE_SIZE });

	if (!result.success) {
		return <p className="text-destructive text-sm">{result.error}</p>;
	}

	const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID ?? null;

	return (
		<div className="space-y-6">
			<MessagingJobSummaryCard job={result.data.job} />
			<MessagingJobMessagesTable jobId={jobId} messages={result.data.messages} twilioAccountSid={twilioAccountSid} />
		</div>
	);
};
