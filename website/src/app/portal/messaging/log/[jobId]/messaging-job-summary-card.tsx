import { Badge } from '@/components/badge';
import type { MessagingJobDetailView } from '@/lib/services/twilio/messaging/twilio-messaging.types';

type Props = {
	job: MessagingJobDetailView['job'];
};

const jobStatusVariant = (status: MessagingJobDetailView['job']['status']) => {
	switch (status) {
		case 'completed':
			return 'verified';
		case 'running':
			return 'secondary';
		case 'failed':
			return 'destructive';
		case 'interrupted':
			return 'default';
	}
};

const formatDate = (d: Date | null) =>
	d === null
		? '—'
		: d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

export const MessagingJobSummaryCard = ({ job }: Props) => {
	return (
		<section className="space-y-4 rounded-md border p-6">
			<header className="flex items-start justify-between gap-4">
				<div>
					<h2 className="text-lg font-medium">{job.templateFriendlyName}</h2>
					<p className="text-muted-foreground font-mono text-xs">{job.templateSid}</p>
				</div>
				<div className="flex gap-2">
					<Badge variant="default" className="uppercase">
						{job.channelRequested}
					</Badge>
					<Badge variant={jobStatusVariant(job.status)}>{job.status}</Badge>
				</div>
			</header>

			<dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
				<div>
					<dt className="text-muted-foreground">Recipient type</dt>
					<dd>{job.recipientType}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Total selected</dt>
					<dd>{job.totalSelected}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Sent</dt>
					<dd>{job.sentCount}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Delivered</dt>
					<dd>{job.deliveredCount}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Failed</dt>
					<dd>{job.failedCount}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Skipped</dt>
					<dd>{job.skippedCount}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Fallback</dt>
					<dd>{job.fallbackCount}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Started</dt>
					<dd>{formatDate(job.startedAt)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Finished</dt>
					<dd>{formatDate(job.finishedAt)}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">By</dt>
					<dd>{job.createdByName}</dd>
				</div>
			</dl>
		</section>
	);
};
