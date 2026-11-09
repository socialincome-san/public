'use client';

import type { MessagingChannel } from '@/generated/prisma/client';
import type { MessagingJobStatusView } from '@/modules/messaging/messaging.types';
import { cn } from '@socialincome/design-system/cn';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { SendPhase } from './use-messaging-send';

type SendProgressProps = {
	phase: SendPhase;
	status: MessagingJobStatusView | null;
	error: string | null;
	resultsUnavailable: boolean;
	channel: MessagingChannel;
};

type ResultRow = {
	label: string;
	value: number;
	tone: 'confirm' | 'destructive' | 'muted';
	note?: string;
};

const toneDot: Record<ResultRow['tone'], string> = {
	confirm: 'bg-confirm',
	destructive: 'bg-destructive',
	muted: 'bg-muted-foreground/40',
};

export const SendProgress = ({ phase, status, error, resultsUnavailable, channel }: SendProgressProps) => {
	const t = useTranslations('portal-messaging');

	if (phase === 'running') {
		return (
			<div className="flex flex-col items-center gap-4 py-12 text-center">
				<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" aria-hidden />
				<div className="space-y-1">
					<h3 className="text-base font-medium">{t('wizard.progress.sendingMessage')}</h3>
					<p className="text-muted-foreground text-sm">{t('wizard.progress.keepOpen')}</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-2 py-4">
				<h3 className="text-base font-medium">{t('wizard.progress.sendFailed')}</h3>
				<p className="text-destructive text-sm">{error}</p>
			</div>
		);
	}

	const rows: ResultRow[] = status
		? [
				{
					label: t('wizard.progress.sent'),
					value: status.sentCount,
					tone: 'confirm',
					note: status.fallbackCount > 0 ? t('wizard.progress.viaFallback', { count: status.fallbackCount }) : undefined,
				},
				{ label: t('wizard.progress.failed'), value: status.failedCount, tone: 'destructive' },
				{
					label: t('wizard.progress.skipped'),
					value: status.skippedCount,
					tone: 'muted',
					note: t('wizard.progress.noPhone'),
				},
				{
					label: t('wizard.progress.deliveredSoFar'),
					value: status.deliveredCount,
					tone: 'muted',
					note: t('wizard.progress.deliveryUpdatesDelayed'),
				},
			]
		: [];

	return (
		<div className="space-y-4 py-2">
			<div className="space-y-1">
				<h3 className="text-base font-medium">{t('wizard.progress.sendComplete')}</h3>
				<p className="text-muted-foreground text-sm">
					{t('wizard.progress.dispatchedVia', {
						channel: channel === 'sms' ? t('common.channels.sms') : t('common.channels.whatsapp'),
					})}
				</p>
			</div>
			{resultsUnavailable && <p className="text-muted-foreground text-sm">{t('wizard.progress.resultsUnavailable')}</p>}
			{status && (
				<dl className="divide-border divide-y overflow-hidden rounded-lg border">
					{rows.map((row) => (
						<div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
							<dt className="flex items-center gap-2.5 text-sm">
								<span className={cn('size-2 rounded-full', toneDot[row.tone])} aria-hidden />
								<span>{row.label}</span>
								{row.note && <span className="text-muted-foreground text-xs">· {row.note}</span>}
							</dt>
							<dd className="text-sm font-medium tabular-nums">{row.value}</dd>
						</div>
					))}
				</dl>
			)}
		</div>
	);
};
