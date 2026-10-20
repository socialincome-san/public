import { twilioMessageLogUrl } from '@/app/portal/messaging/twilio-console-url';
import type { MessagingJobDetailView, MessagingJobMessageRow } from '@/modules/messaging/messaging.types';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@socialincome/design-system/data-display/table/table';
import { ExternalLink } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';

type MessagesTableProps = {
	jobId: string;
	messages: MessagingJobDetailView['messages'];
	twilioAccountSid: string | null;
};

const messageStatusBadge = (row: MessagingJobMessageRow, t: Awaited<ReturnType<typeof getTranslations>>) => {
	if (row.skippedReason) {
		const reason =
			row.skippedReason === 'no_phone'
				? t('deliveryLog.messageStatus.noPhone')
				: row.skippedReason === 'no_channel_available'
					? t('deliveryLog.messageStatus.noChannelAvailable')
					: row.skippedReason;

		return <span className="text-muted-foreground text-sm">{t('deliveryLog.messageStatus.skipped', { reason })}</span>;
	}
	const s = row.twilioStatus;
	if (s === 'delivered') {
		return <Badge variant="verified">{t('status.messages.delivered')}</Badge>;
	}
	if (s === 'sent') {
		return <Badge variant="default">{t('status.messages.sent')}</Badge>;
	}
	if (s === 'queued') {
		return <Badge variant="secondary">{t('status.messages.queued')}</Badge>;
	}
	if (s === 'accepted') {
		return <Badge variant="secondary">{t('status.messages.accepted')}</Badge>;
	}
	if (s === 'scheduled') {
		return <Badge variant="secondary">{t('status.messages.scheduled')}</Badge>;
	}
	if (s === 'sending' || s === 'receiving') {
		return (
			<Badge variant="secondary">{s === 'sending' ? t('status.messages.sending') : t('status.messages.receiving')}</Badge>
		);
	}
	if (s === 'received' || s === 'read') {
		return <Badge variant="verified">{s === 'received' ? t('status.messages.received') : t('status.messages.read')}</Badge>;
	}
	if (s === 'canceled') {
		return <Badge variant="secondary">{t('status.messages.canceled')}</Badge>;
	}
	if (s === 'failed' || s === 'undelivered') {
		return (
			<Badge variant="destructive">{s === 'failed' ? t('status.messages.failed') : t('status.messages.undelivered')}</Badge>
		);
	}

	return <span className="text-muted-foreground text-sm">{s ?? '—'}</span>;
};

const formatDate = (d: Date, locale: string) =>
	d.toLocaleString(locale, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

export const MessagesTable = async ({ jobId, messages, twilioAccountSid }: MessagesTableProps) => {
	const t = await getTranslations('portal-messaging');
	const locale = await getLocale();
	const totalPages = Math.max(1, Math.ceil(messages.totalCount / messages.pageSize));

	if (messages.totalCount === 0) {
		return <p className="text-muted-foreground text-sm">{t('deliveryLog.noMessages')}</p>;
	}

	return (
		<div className="space-y-3">
			{messages.rows.length === 0 ? (
				<p className="text-muted-foreground text-sm">{t('deliveryLog.noMessagesOnPage')}</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t('deliveryLog.columns.contact')}</TableHead>
							<TableHead>{t('deliveryLog.columns.channel')}</TableHead>
							<TableHead>{t('deliveryLog.columns.status')}</TableHead>
							<TableHead>{t('deliveryLog.columns.error')}</TableHead>
							<TableHead>{t('deliveryLog.columns.sent')}</TableHead>
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
									<TableCell>
										{m.channelUsed === 'sms'
											? t('common.channels.sms')
											: m.channelUsed === 'whatsapp'
												? t('common.channels.whatsapp')
												: '—'}
										{m.fellBack && <span className="text-muted-foreground ml-1">({t('deliveryLog.fallback')})</span>}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{messageStatusBadge(m, t)}
											{canLinkToTwilio && (
												<a
													href={twilioMessageLogUrl(twilioAccountSid, m.twilioMessageSid!)}
													target="_blank"
													rel="noopener noreferrer"
													aria-label={t('common.openInTwilio')}
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
									<TableCell>
										<span className="text-muted-foreground">{formatDate(m.createdAt, locale)}</span>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}

			<div className="text-muted-foreground flex items-center justify-between text-sm">
				<p>
					{t('common.pageOf', { page: messages.page, totalPages })} (
					{t('deliveryLog.messageCount', { count: messages.totalCount })})
				</p>
				<div className="flex gap-2">
					{messages.page > 1 && (
						<Link href={`/portal/messaging/delivery-log/${jobId}?msgPage=${messages.page - 1}`} className="hover:underline">
							{t('common.previous')}
						</Link>
					)}
					{messages.page < totalPages && (
						<Link href={`/portal/messaging/delivery-log/${jobId}?msgPage=${messages.page + 1}`} className="hover:underline">
							{t('common.next')}
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};
