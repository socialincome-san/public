import { Badge } from '@/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import type { MessagingJobDetailView, MessagingJobMessageRow } from '@/lib/services/twilio/messaging/logs/log.types';
import { twilioMessageLogUrl } from '@/lib/services/twilio/messaging/twilio-console-urls';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

type MessagesTableProps = {
	jobId: string;
	messages: MessagingJobDetailView['messages'];
	twilioAccountSid: string | null;
};

const messageStatusBadge = (row: MessagingJobMessageRow) => {
	if (row.skippedReason) {
		return <span className="text-muted-foreground text-sm">skipped ({row.skippedReason})</span>;
	}
	const s = row.twilioStatus;
	if (s === 'delivered') {
		return <Badge variant="verified">delivered</Badge>;
	}
	if (s === 'sent') {
		return <Badge variant="default">sent</Badge>;
	}
	if (s === 'queued') {
		return <Badge variant="secondary">queued</Badge>;
	}
	if (s === 'failed' || s === 'undelivered') {
		return <Badge variant="destructive">{s}</Badge>;
	}

	return <span className="text-muted-foreground text-sm">{s ?? '—'}</span>;
};

const formatDate = (d: Date) =>
	d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

export const MessagesTable = ({ jobId, messages, twilioAccountSid }: MessagesTableProps) => {
	const totalPages = Math.max(1, Math.ceil(messages.totalCount / messages.pageSize));

	if (messages.totalCount === 0) {
		return <p className="text-muted-foreground text-sm">No messages for this job.</p>;
	}

	return (
		<div className="space-y-3">
			{messages.rows.length === 0 ? (
				<p className="text-muted-foreground text-sm">No messages on this page.</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Contact</TableHead>
							<TableHead>Channel</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Error</TableHead>
							<TableHead>Sent</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{messages.rows.map((m) => {
							const canLinkToTwilio = twilioAccountSid !== null && m.twilioMessageSid !== null;

							return (
								<TableRow key={m.id}>
									<TableCell>
										<div>{m.contactName}</div>
										<div className="text-muted-foreground text-xs">{m.phoneNumber ?? '—'}</div>
									</TableCell>
									<TableCell className="uppercase">
										{m.channelUsed ?? '—'}
										{m.fellBack && <span className="text-muted-foreground ml-1 normal-case">(fallback)</span>}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{messageStatusBadge(m)}
											{canLinkToTwilio && (
												<a
													href={twilioMessageLogUrl(twilioAccountSid, m.twilioMessageSid!)}
													target="_blank"
													rel="noopener noreferrer"
													aria-label="Open in Twilio console"
													className="text-muted-foreground hover:text-foreground"
												>
													<ExternalLink className="h-3.5 w-3.5" />
												</a>
											)}
										</div>
									</TableCell>
									<TableCell>
										{m.twilioErrorCode && <div className="font-mono text-xs">{m.twilioErrorCode}</div>}
										{m.twilioErrorMessage && <div className="text-muted-foreground text-xs">{m.twilioErrorMessage}</div>}
										{!m.twilioErrorCode && !m.twilioErrorMessage && <span className="text-muted-foreground">—</span>}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">{formatDate(m.createdAt)}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}

			<div className="text-muted-foreground flex items-center justify-between text-sm">
				<p>
					Page {messages.page} of {totalPages} ({messages.totalCount} message{messages.totalCount === 1 ? '' : 's'})
				</p>
				<div className="flex gap-2">
					{messages.page > 1 && (
						<Link href={`/portal/messaging/delivery-log/${jobId}?msgPage=${messages.page - 1}`} className="hover:underline">
							Prev
						</Link>
					)}
					{messages.page < totalPages && (
						<Link href={`/portal/messaging/delivery-log/${jobId}?msgPage=${messages.page + 1}`} className="hover:underline">
							Next
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};
