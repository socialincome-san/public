import { jobStatusVariant } from '@/app/portal/messaging/delivery-log/messaging-job-status';
import { twilioTemplateUrl } from '@/app/portal/messaging/twilio-console-url';
import type { MessagingJobDetailView } from '@/modules/messaging/messaging.types';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { RecordSummary } from '@socialincome/design-system/data-display/record-summary/record-summary';
import { getLocale, getTranslations } from 'next-intl/server';

type SummaryCardProps = {
	job: MessagingJobDetailView['job'];
	templateBody: string | null;
	templateError: string | null;
	twilioAccountSid: string | null;
};

const formatDate = (d: Date | null, locale: string) =>
	d === null
		? '—'
		: d.toLocaleString(locale, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

export const SummaryCard = async ({ job, templateBody, templateError, twilioAccountSid }: SummaryCardProps) => {
	const t = await getTranslations('portal-messaging');
	const locale = await getLocale();
	const statusLabel = (() => {
		switch (job.status) {
			case 'completed':
				return t('status.jobs.completed');
			case 'running':
				return t('status.jobs.running');
			case 'failed':
				return t('status.jobs.failed');
			case 'interrupted':
				return t('status.jobs.interrupted');
		}
	})();
	const recipientType = (() => {
		switch (job.recipientType) {
			case 'contributor':
				return t('wizard.recipientTypes.contributor');
			case 'recipient':
				return t('wizard.recipientTypes.recipient');
			case 'local-partner':
				return t('wizard.recipientTypes.localPartner');
		}
	})();

	return (
		<RecordSummary
			title={job.templateFriendlyName}
			identifier={job.templateSid}
			externalLink={
				twilioAccountSid
					? { href: twilioTemplateUrl(twilioAccountSid, job.templateSid), label: t('common.viewInTwilio') }
					: undefined
			}
			aside={
				<>
					<Badge variant="default">
						{job.channelRequested === 'sms' ? t('common.channels.sms') : t('common.channels.whatsapp')}
					</Badge>
					<Badge variant={jobStatusVariant(job.status)}>{statusLabel}</Badge>
				</>
			}
			columns={5}
			fields={[
				{ label: t('deliveryLog.summary.recipientType'), value: recipientType },
				{ label: t('deliveryLog.summary.totalSelected'), value: job.totalSelected },
				{ label: t('deliveryLog.columns.sent'), value: job.sentCount },
				{ label: t('deliveryLog.summary.delivered'), value: job.deliveredCount },
				{ label: t('status.jobs.failed'), value: job.failedCount },
				{ label: t('status.messages.skipped'), value: job.skippedCount },
				{ label: t('deliveryLog.fallback'), value: job.fallbackCount },
				{ label: t('deliveryLog.summary.started'), value: formatDate(job.startedAt, locale) },
				{ label: t('deliveryLog.summary.finished'), value: formatDate(job.finishedAt, locale) },
				{ label: t('deliveryLog.columns.by'), value: job.createdByName },
			]}
			section={{
				title: t('templates.summary.messageBody'),
				content: templateBody ? (
					<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{templateBody}</pre>
				) : templateError ? (
					<p className="text-destructive text-sm">{t('deliveryLog.templateBodyError', { error: templateError })}</p>
				) : (
					<p className="text-muted-foreground text-sm">{t('common.noBody')}</p>
				),
			}}
		/>
	);
};
