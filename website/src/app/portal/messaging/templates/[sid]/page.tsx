import { MessagingTemplateSummaryCard } from '@/app/portal/messaging/templates/[sid]/messaging-template-summary-card';
import { AppLoadingSkeleton } from '@/components/skeletons/app-loading-skeleton';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import Link from 'next/link';
import { Suspense } from 'react';

type MessagingTemplatePageProps = {
	params: Promise<{ sid: string }>;
};

export default function MessagingTemplatePage({ params }: MessagingTemplatePageProps) {
	return (
		<Suspense fallback={<AppLoadingSkeleton />}>
			<MessagingTemplateDataLoader params={params} />
		</Suspense>
	);
}

const MessagingTemplateDataLoader = async ({ params }: MessagingTemplatePageProps) => {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);

	const { sid } = await params;
	const result = await services.messagingTwilioTemplates.getTwilioTemplate(sid);

	if (!result.success) {
		return <p className="text-destructive text-sm">{result.error}</p>;
	}

	const template = result.data;
	const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID ?? null;

	return (
		<div className="space-y-6">
			<Link href="/portal/messaging/templates" className="text-muted-foreground hover:text-foreground text-sm">
				← Back to templates
			</Link>

			<MessagingTemplateSummaryCard template={template} twilioAccountSid={twilioAccountSid} />
		</div>
	);
};
