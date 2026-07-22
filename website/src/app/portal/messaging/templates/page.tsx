import { MessagingTemplatesTable } from '@/app/portal/messaging/templates/messaging-templates-table';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';

export default function MessagingTemplatesPage() {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MessagingTemplatesDataLoader />
		</Suspense>
	);
}

const MessagingTemplatesDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);

	const result = await services.messagingTwilioTemplates.listTwilioTemplates();

	return (
		<MessagingTemplatesTable templates={result.success ? result.data : []} error={result.success ? null : result.error} />
	);
};
