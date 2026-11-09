import { jobStatusVariant } from '@/app/portal/messaging/delivery-log/messaging-job-status';
import type { MessagingJobListRow } from '@/modules/messaging/messaging.types';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@socialincome/design-system/data-display/table/table';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';

type MessagingJobsTableProps = {
	rows: MessagingJobListRow[];
	error: string | null;
	page: number;
	pageSize: number;
	totalCount: number;
};

const formatStartedAt = (d: Date, locale: string) =>
	d.toLocaleString(locale, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

const jobStatusLabel = (
	status: MessagingJobListRow['status'],
	t: Awaited<ReturnType<typeof import('next-intl/server').getTranslations>>,
) => {
	switch (status) {
		case 'completed':
			return t('status.jobs.completed');
		case 'running':
			return t('status.jobs.running');
		case 'failed':
			return t('status.jobs.failed');
		case 'interrupted':
			return t('status.jobs.interrupted');
	}
};

export const MessagingJobsTable = async ({ rows, error, page, pageSize, totalCount }: MessagingJobsTableProps) => {
	const t = await getTranslations('portal-messaging');
	const locale = await getLocale();

	if (error) {
		return <p className="text-destructive text-sm">{t('common.errorDetails', { error })}</p>;
	}

	if (totalCount === 0) {
		return <p className="text-muted-foreground text-sm">{t('deliveryLog.noJobs')}</p>;
	}

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	// When `page` is past the end (e.g. a stale/hand-edited URL), send "Prev" to the last real page
	// instead of decrementing one step at a time through empty pages.
	const prevPage = Math.min(page, totalPages) - 1;

	return (
		<div className="space-y-3">
			{rows.length === 0 ? (
				<p className="text-muted-foreground text-sm">{t('deliveryLog.noJobsOnPage')}</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('deliveryLog.columns.template')}</TableHead>
							<TableHead>{t('deliveryLog.columns.channel')}</TableHead>
							<TableHead>{t('deliveryLog.columns.sent')}</TableHead>
							<TableHead>{t('deliveryLog.columns.status')}</TableHead>
							<TableHead>{t('deliveryLog.columns.started')}</TableHead>
							<TableHead>{t('deliveryLog.columns.by')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((job) => (
							<TableRow key={job.id}>
								<TableCell>
									<Link href={`/portal/messaging/delivery-log/${job.id}`} className="font-medium hover:underline">
										{job.templateFriendlyName}
									</Link>
								</TableCell>
								<TableCell>
									{job.channelRequested === 'sms' ? t('common.channels.sms') : t('common.channels.whatsapp')}
								</TableCell>
								<TableCell>
									{job.sentCount} / {job.totalSelected}
								</TableCell>
								<TableCell>
									<Badge variant={jobStatusVariant(job.status)}>{jobStatusLabel(job.status, t)}</Badge>
								</TableCell>
								<TableCell>
									<span className="text-muted-foreground">{formatStartedAt(job.startedAt, locale)}</span>
								</TableCell>
								<TableCell>{job.createdByName}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			<div className="text-muted-foreground flex items-center justify-between text-sm">
				<p>
					{t('common.pageOf', { page, totalPages })} ({t('deliveryLog.jobCount', { count: totalCount })})
				</p>
				<div className="flex gap-2">
					{prevPage >= 1 && (
						<Link href={`/portal/messaging/delivery-log?page=${prevPage}`} className="hover:underline">
							{t('common.previous')}
						</Link>
					)}
					{page < totalPages && (
						<Link href={`/portal/messaging/delivery-log?page=${page + 1}`} className="hover:underline">
							{t('common.next')}
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};
