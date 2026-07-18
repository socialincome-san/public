import { jobStatusVariant } from '@/app/portal/messaging/delivery-log/messaging-job-status';
import { Badge } from '@/components/badge';
import type { MessagingJobDetailView } from '@/lib/services/twilio/messaging/logs/log.types';
import { twilioTemplateUrl } from '@/lib/services/twilio/messaging/twilio-console-urls';
import { ExternalLink } from 'lucide-react';

type SummaryCardProps = {
	job: MessagingJobDetailView['job'];
	templateBody: string | null;
	twilioAccountSid: string | null;
};

const formatDate = (d: Date | null) =>
	d === null
		? '—'
		: d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

export const SummaryCard = ({ job, templateBody, twilioAccountSid }: SummaryCardProps) => {
	return (
		<section className="space-y-6">
			<header className="flex items-start justify-between gap-4">
				<div className="min-w-0 space-y-1.5">
					<h2 className="text-xl font-semibold tracking-tight">{job.templateFriendlyName}</h2>
					<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
						<span className="font-mono">{job.templateSid}</span>
						{twilioAccountSid && (
							<a
								href={twilioTemplateUrl(twilioAccountSid, job.templateSid)}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
							>
								View in Twilio
								<ExternalLink className="h-3 w-3" />
							</a>
						)}
					</div>
				</div>
				<div className="flex shrink-0 gap-2">
					<Badge variant="default" className="uppercase">
						{job.channelRequested}
					</Badge>
					<Badge variant={jobStatusVariant(job.status)}>{job.status}</Badge>
				</div>
			</header>

			<dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 sm:grid-cols-3 lg:grid-cols-5">
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Recipient type</dt>
					<dd className="text-sm">{job.recipientType}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Total selected</dt>
					<dd className="text-sm">{job.totalSelected}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Sent</dt>
					<dd className="text-sm">{job.sentCount}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Delivered</dt>
					<dd className="text-sm">{job.deliveredCount}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Failed</dt>
					<dd className="text-sm">{job.failedCount}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Skipped</dt>
					<dd className="text-sm">{job.skippedCount}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Fallback</dt>
					<dd className="text-sm">{job.fallbackCount}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Started</dt>
					<dd className="text-sm">{formatDate(job.startedAt)}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">Finished</dt>
					<dd className="text-sm">{formatDate(job.finishedAt)}</dd>
				</div>
				<div className="space-y-1">
					<dt className="text-muted-foreground text-xs">By</dt>
					<dd className="text-sm">{job.createdByName}</dd>
				</div>
			</dl>

			<div className="space-y-2 border-t pt-6">
				<h3 className="text-muted-foreground text-xs">Message body</h3>
				{templateBody ? (
					<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{templateBody}</pre>
				) : (
					<p className="text-muted-foreground text-sm">(no body)</p>
				)}
			</div>
		</section>
	);
};
