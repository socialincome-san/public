import { MessagingOverviewTable } from '@/app/portal/messaging/overview/messaging-overview-table';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';

export default function MessagingOverviewPage() {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MessagingOverviewDataLoader />
		</Suspense>
	);
}

const MessagingOverviewDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);

	const result = await services.twilioMessaging.listContentTemplates();

	return (
		<MessagingOverviewTable templates={result.success ? result.data : []} error={result.success ? null : result.error} />
	);
};
