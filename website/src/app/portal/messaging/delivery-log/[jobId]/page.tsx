import { MessagesTable } from '@/app/portal/messaging/delivery-log/[jobId]/messages-table';
import { SummaryCard } from '@/app/portal/messaging/delivery-log/[jobId]/summary-card';
import { SyncStatusButton } from '@/app/portal/messaging/delivery-log/[jobId]/sync-status-button';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { getMessagingJobDetailAction } from '@/lib/server-actions/messaging-actions';
import { services } from '@/lib/services/services';
import type { AnySearchParams } from '@/lib/types/page-props';
import Link from 'next/link';
import { Suspense } from 'react';

const MESSAGES_PAGE_SIZE = 25;

type MessagingJobDetailPageProps = {
	params: Promise<{ jobId: string }>;
	searchParams: Promise<AnySearchParams>;
};

export default function MessagingJobDetailPage(props: MessagingJobDetailPageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MessagingJobDetailDataLoader {...props} />
		</Suspense>
	);
}

const MessagingJobDetailDataLoader = async ({ params, searchParams }: MessagingJobDetailPageProps) => {
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

	const templateResult = await services.messagingTwilioTemplates.getTwilioTemplate(result.data.job.templateSid);
	const templateBody = templateResult.success ? templateResult.data.body : null;
	const templateError = templateResult.success ? null : templateResult.error;

	return (
		<div className="space-y-6">
			<Link href="/portal/messaging/delivery-log" className="text-muted-foreground hover:text-foreground text-sm">
				← Back to delivery log
			</Link>

			<SummaryCard
				job={result.data.job}
				templateBody={templateBody}
				templateError={templateError}
				twilioAccountSid={twilioAccountSid}
			/>
			<div className="space-y-3">
				<div className="flex items-center justify-between gap-4">
					<h3 className="text-sm font-medium">Message recipients</h3>
					<SyncStatusButton jobId={jobId} />
				</div>
				<MessagesTable jobId={jobId} messages={result.data.messages} twilioAccountSid={twilioAccountSid} />
			</div>
		</div>
	);
};
