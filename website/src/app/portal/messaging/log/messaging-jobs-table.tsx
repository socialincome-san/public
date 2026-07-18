import { Badge } from '@/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import type { MessagingJobListRow } from '@/lib/services/twilio/messaging/twilio-messaging.types';
import Link from 'next/link';

type Props = {
	rows: MessagingJobListRow[];
	error: string | null;
	page: number;
	pageSize: number;
	totalCount: number;
};

const jobStatusVariant = (status: MessagingJobListRow['status']) => {
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

const formatStartedAt = (d: Date) =>
	d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

export const MessagingJobsTable = ({ rows, error, page, pageSize, totalCount }: Props) => {
	if (error) {
		return <p className="text-destructive text-sm">{error}</p>;
	}

	if (totalCount === 0) {
		return <p className="text-muted-foreground text-sm">No messaging jobs yet.</p>;
	}

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

	return (
		<div className="space-y-3">
			{rows.length === 0 ? (
				<p className="text-muted-foreground text-sm">No jobs on this page.</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Template</TableHead>
							<TableHead>Channel</TableHead>
							<TableHead>Sent</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Started</TableHead>
							<TableHead>By</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((job) => (
							<TableRow key={job.id}>
								<TableCell className="font-medium">
									<Link href={`/portal/messaging/log/${job.id}`} className="hover:underline">
										{job.templateFriendlyName}
									</Link>
								</TableCell>
								<TableCell className="uppercase">{job.channelRequested}</TableCell>
								<TableCell>
									{job.sentCount} / {job.totalSelected}
								</TableCell>
								<TableCell>
									<Badge variant={jobStatusVariant(job.status)}>{job.status}</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground text-sm">{formatStartedAt(job.startedAt)}</TableCell>
								<TableCell>{job.createdByName}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			<div className="text-muted-foreground flex items-center justify-between text-sm">
				<p>
					Page {page} of {totalPages} ({totalCount} job{totalCount === 1 ? '' : 's'})
				</p>
				<div className="flex gap-2">
					{page > 1 && (
						<Link href={`/portal/messaging/log?page=${page - 1}`} className="hover:underline">
							Prev
						</Link>
					)}
					{page < totalPages && (
						<Link href={`/portal/messaging/log?page=${page + 1}`} className="hover:underline">
							Next
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};
