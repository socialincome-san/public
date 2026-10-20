import { MessagingTemplateSummaryCard } from '@/app/portal/messaging/templates/[sid]/messaging-template-summary-card';
import { getTwilioTemplate } from '@/modules/messaging/messaging.service';
import { requireAdmin } from '@/server/session';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { getTranslations } from 'next-intl/server';
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
	const user = await requireAdmin();
	const t = await getTranslations('portal-messaging');

	const { sid } = await params;
	const result = await getTwilioTemplate(sid, user.id);

	if (!result.success) {
		return <p className="text-destructive text-sm">{t('common.errorDetails', { error: result.error })}</p>;
	}

	const template = result.data;
	const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID ?? null;

	return (
		<div className="space-y-6">
			<Link href="/portal/messaging/templates" className="text-muted-foreground hover:text-foreground text-sm">
				← {t('templates.back')}
			</Link>

			<MessagingTemplateSummaryCard template={template} twilioAccountSid={twilioAccountSid} />
		</div>
	);
};
