'use client';

import type { MessagingChannel } from '@/generated/prisma/client';
import type { MessagingJobStatusView } from '@/lib/services/twilio/messaging/dispatch/dispatch.types';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import type { SendPhase } from './use-messaging-send';

type SendProgressProps = {
	phase: SendPhase;
	status: MessagingJobStatusView | null;
	error: string | null;
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

export const SendProgress = ({ phase, status, error, channel }: SendProgressProps) => {
	if (phase === 'running') {
		return (
			<div className="flex flex-col items-center gap-4 py-12 text-center">
				<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" aria-hidden />
				<div className="space-y-1">
					<h3 className="text-base font-medium">Sending your message…</h3>
					<p className="text-muted-foreground text-sm">This can take a moment. Please keep this open.</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-2 py-4">
				<h3 className="text-base font-medium">Send failed</h3>
				<p className="text-destructive text-sm">{error}</p>
			</div>
		);
	}

	const rows: ResultRow[] = status
		? [
				{
					label: 'Sent',
					value: status.sentCount,
					tone: 'confirm',
					note: status.fallbackCount > 0 ? `${status.fallbackCount} via fallback` : undefined,
				},
				{ label: 'Failed', value: status.failedCount, tone: 'destructive' },
				{ label: 'Skipped', value: status.skippedCount, tone: 'muted', note: 'no phone number' },
				{
					label: 'Delivered so far',
					value: status.deliveredCount,
					tone: 'muted',
					note: 'updates from Twilio after a short delay',
				},
			]
		: [];

	return (
		<div className="space-y-4 py-2">
			<div className="space-y-1">
				<h3 className="text-base font-medium">Send complete</h3>
				<p className="text-muted-foreground text-sm">Your message was dispatched via {channel.toUpperCase()}.</p>
			</div>
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
