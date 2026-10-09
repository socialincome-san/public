import { jobStatusVariant } from '@/app/portal/messaging/delivery-log/messaging-job-status';
import { twilioTemplateUrl } from '@/app/portal/messaging/twilio-console-url';
import type { MessagingJobDetailView } from '@/modules/messaging/messaging.types';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { RecordSummary } from '@socialincome/design-system/data-display/record-summary/record-summary';

type SummaryCardProps = {
	job: MessagingJobDetailView['job'];
	templateBody: string | null;
	templateError: string | null;
	twilioAccountSid: string | null;
};

const formatDate = (d: Date | null) =>
	d === null
		? '—'
		: d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

export const SummaryCard = ({ job, templateBody, templateError, twilioAccountSid }: SummaryCardProps) => (
	<RecordSummary
		title={job.templateFriendlyName}
		identifier={job.templateSid}
		externalLink={
			twilioAccountSid ? { href: twilioTemplateUrl(twilioAccountSid, job.templateSid), label: 'View in Twilio' } : undefined
		}
		aside={
			<>
				<Badge variant="default">{job.channelRequested}</Badge>
				<Badge variant={jobStatusVariant(job.status)}>{job.status}</Badge>
			</>
		}
		columns={5}
		fields={[
			{ label: 'Recipient type', value: job.recipientType },
			{ label: 'Total selected', value: job.totalSelected },
			{ label: 'Sent', value: job.sentCount },
			{ label: 'Delivered', value: job.deliveredCount },
			{ label: 'Failed', value: job.failedCount },
			{ label: 'Skipped', value: job.skippedCount },
			{ label: 'Fallback', value: job.fallbackCount },
			{ label: 'Started', value: formatDate(job.startedAt) },
			{ label: 'Finished', value: formatDate(job.finishedAt) },
			{ label: 'By', value: job.createdByName },
		]}
		section={{
			title: 'Message body',
			content: templateBody ? (
				<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{templateBody}</pre>
			) : templateError ? (
				<p className="text-destructive text-sm">Couldn’t load template body: {templateError}</p>
			) : (
				<p className="text-muted-foreground text-sm">(no body)</p>
			),
		}}
	/>
);
