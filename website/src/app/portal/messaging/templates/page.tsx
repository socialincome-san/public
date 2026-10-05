import { MessagingTemplatesTable } from '@/app/portal/messaging/templates/messaging-templates-table';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { listTwilioTemplates } from '@/modules/messaging/messaging.service';
import { requireAdmin } from '@/server/session';
import { Suspense } from 'react';

export default function MessagingTemplatesPage() {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MessagingTemplatesDataLoader />
		</Suspense>
	);
}

const MessagingTemplatesDataLoader = async () => {
	const user = await requireAdmin();

	const result = await listTwilioTemplates(user.id);

	return (
		<MessagingTemplatesTable templates={result.success ? result.data : []} error={result.success ? null : result.error} />
	);
};
