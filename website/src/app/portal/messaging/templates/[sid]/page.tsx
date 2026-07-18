import { MessagingTemplateDetail } from '@/app/portal/messaging/templates/[sid]/messaging-template-detail';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';

type Props = {
	params: Promise<{ sid: string }>;
};

export default function MessagingTemplatePage({ params }: Props) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MessagingTemplateDataLoader params={params} />
		</Suspense>
	);
}

const MessagingTemplateDataLoader = async ({ params }: Props) => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);

	const { sid } = await params;
	const result = await services.twilioMessaging.getContentTemplate(sid);

	if (!result.success) {
		return <p className="text-destructive text-sm">{result.error}</p>;
	}

	return <MessagingTemplateDetail template={result.data} />;
};
