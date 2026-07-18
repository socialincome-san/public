'use client';

import { Button } from '@/components/button';
import type { MessagingChannel } from '@/generated/prisma/client';
import { getMessagingJobAction, startMessagingSendAction } from '@/lib/server-actions/messaging-actions';
import type { MessagingRecipientType, SelectionState } from '@/lib/services/twilio/messaging/recipients.types';
import type {
	ChannelPreviewSummary,
	MessagingJobStatusView,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-messaging.types';
import { useEffect, useState } from 'react';

const POLL_INTERVAL_MS = 1500;

type Phase = 'confirm' | 'running' | 'results';

type Props = {
	templateSid: string;
	templateFriendlyName: string;
	channel: MessagingChannel;
	recipientType: MessagingRecipientType;
	selection: SelectionState;
	assignments: VariableAssignments;
	preview: ChannelPreviewSummary;
	onClose: () => void;
};

export const Step5Send = ({
	templateSid,
	templateFriendlyName,
	channel,
	recipientType,
	selection,
	assignments,
	preview,
	onClose,
}: Props) => {
	const [phase, setPhase] = useState<Phase>('confirm');
	const [error, setError] = useState<string | null>(null);
	const [jobId, setJobId] = useState<string | null>(null);
	const [status, setStatus] = useState<MessagingJobStatusView | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const onConfirm = async () => {
		if (isSubmitting) {
			return;
		}
		setIsSubmitting(true);
		setError(null);
		const result = await startMessagingSendAction({
			templateSid,
			channel,
			recipientType,
			selection,
			assignments,
		});
		if (!result.success) {
			setError(result.error);
			setIsSubmitting(false);

			return;
		}
		setJobId(result.data.jobId);
		setPhase('running');
	};

	useEffect(() => {
		if (phase !== 'running' || !jobId) {
			return;
		}
		let cancelled = false;
		let timerId: ReturnType<typeof setTimeout> | null = null;
		const poll = async () => {
			const result = await getMessagingJobAction(jobId);
			if (cancelled) {
				return;
			}
			if (!result.success) {
				setError(result.error);
				setPhase('results');

				return;
			}
			setStatus(result.data);
			if (result.data.status === 'running') {
				timerId = setTimeout(poll, POLL_INTERVAL_MS);

				return;
			}
			setPhase('results');
		};
		void poll();

		return () => {
			cancelled = true;
			if (timerId !== null) {
				clearTimeout(timerId);
			}
		};
	}, [phase, jobId]);

	if (phase === 'confirm') {
		const fallbackText =
			preview.fallback > 0 ? ` (${preview.fallback} will fall back to ${channel === 'whatsapp' ? 'SMS' : 'WhatsApp'})` : '';
		const skipText = preview.skippedNoPhone > 0 ? `; ${preview.skippedNoPhone} will be skipped (no phone)` : '';

		return (
			<section className="space-y-4 rounded-md border p-6">
				<h3 className="text-base font-medium">Send &ldquo;{templateFriendlyName}&rdquo;?</h3>
				<p className="text-sm">
					About to send to <span className="font-medium">{preview.primary + preview.fallback}</span> recipient
					{preview.primary + preview.fallback === 1 ? '' : 's'} via {channel.toUpperCase()}
					{fallbackText}
					{skipText}.
				</p>
				{error && <p className="text-destructive text-sm">{error}</p>}
				<div className="flex justify-end gap-2">
					<Button variant="outline" type="button" onClick={onClose}>
						Cancel
					</Button>
					<Button type="button" onClick={onConfirm} disabled={isSubmitting}>
						{isSubmitting ? 'Sending…' : 'Send'}
					</Button>
				</div>
			</section>
		);
	}

	if (phase === 'running') {
		const done = status ? status.sentCount + status.failedCount + status.skippedCount : 0;
		const total = status?.totalSelected ?? 0;
		const pct = total > 0 ? Math.floor((done / total) * 100) : 0;

		return (
			<section className="space-y-4 rounded-md border p-6">
				<h3 className="text-base font-medium">Sending…</h3>
				<div className="bg-muted h-2 w-full overflow-hidden rounded">
					<div className="bg-foreground h-full" style={{ width: `${pct}%` }} />
				</div>
				<p className="text-muted-foreground text-sm">
					{done} of {total} processed
				</p>
			</section>
		);
	}

	return (
		<section className="space-y-4 rounded-md border p-6">
			<h3 className="text-base font-medium">Send complete</h3>
			{error && <p className="text-destructive text-sm">{error}</p>}
			{status && (
				<ul className="space-y-1 text-sm">
					<li>
						<span className="font-medium">{status.sentCount}</span> sent
						{status.fallbackCount > 0 && ` (${status.fallbackCount} via fallback)`}
					</li>
					<li>
						<span className="font-medium">{status.failedCount}</span> failed
					</li>
					<li>
						<span className="font-medium">{status.skippedCount}</span> skipped (no phone)
					</li>
					<li>
						<span className="font-medium">{status.deliveredCount}</span> delivered so far
						<span className="text-muted-foreground"> (updates from Twilio after a delay)</span>
					</li>
				</ul>
			)}
			<div className="flex justify-end">
				<Button variant="outline" type="button" onClick={onClose}>
					Close
				</Button>
			</div>
		</section>
	);
};
