'use client';

import type { MessagingChannel } from '@/generated/prisma/client';
import { previewMessagingChannelAction } from '@/lib/server-actions/messaging-actions';
import type { ChannelPreviewSummary } from '@/lib/services/twilio/messaging/dispatch/dispatch.types';
import type {
	MessagingPhoneSource,
	MessagingRecipientType,
} from '@/lib/services/twilio/messaging/recipients/recipients.types';
import { getSelectedCount } from '@/lib/services/twilio/messaging/recipients/selection';
import type { SelectionState } from '@/lib/services/twilio/messaging/recipients/selection.types';
import type {
	ParsedVariable,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-templates/twilio-template.types';
import { useEffect, useState } from 'react';
import { phoneChoiceLabels } from './phone-labels';
import { renderTemplatePreview } from './render-template-preview';

type Props = {
	body: string | null;
	variables: ParsedVariable[];
	assignments: VariableAssignments;
	selection: SelectionState;
	totalCount: number;
	type: MessagingRecipientType | null;
	channel: MessagingChannel | null;
	phoneSource: MessagingPhoneSource;
	phoneFallbackAllowed: boolean;
	onPreviewLoaded?: (s: ChannelPreviewSummary) => void;
};

export const Step4Summary = ({
	body,
	variables,
	assignments,
	selection,
	totalCount,
	type,
	channel,
	phoneSource,
	phoneFallbackAllowed,
	onPreviewLoaded,
}: Props) => {
	const count = getSelectedCount(selection, totalCount);
	const rendered = body ? renderTemplatePreview(body, variables, assignments) : '';

	// Key the fetched preview to the exact inputs that produced it. When any input changes the key
	// no longer matches, so the loading state is derived rather than reset with a synchronous setState.
	const selectionKey =
		selection.mode === 'include'
			? `include:${[...selection.ids].sort().join(',')}`
			: `all:${selection.search}:${[...selection.excludedIds].sort().join(',')}`;
	const requestKey = type && channel ? `${type}|${channel}|${phoneSource}|${phoneFallbackAllowed}|${selectionKey}` : null;

	const [loaded, setLoaded] = useState<{ key: string; data: ChannelPreviewSummary } | { key: string; error: string } | null>(
		null,
	);

	useEffect(() => {
		if (!type || !channel || !requestKey) {
			return;
		}
		let cancelled = false;
		void previewMessagingChannelAction({ recipientType: type, selection, channel, phoneSource, phoneFallbackAllowed }).then(
			(result) => {
				if (cancelled) {
					return;
				}
				if (result.success) {
					setLoaded({ key: requestKey, data: result.data });
					onPreviewLoaded?.(result.data);
				} else {
					setLoaded({ key: requestKey, error: result.error });
				}
			},
		);

		return () => {
			cancelled = true;
		};
	}, [requestKey, type, channel, phoneSource, phoneFallbackAllowed, selection, onPreviewLoaded]);

	const current = loaded?.key === requestKey ? loaded : null;
	const preview = current && 'data' in current ? current.data : null;
	const previewError = current && 'error' in current ? current.error : null;

	const otherChannel = channel === 'whatsapp' ? 'SMS' : 'WhatsApp';
	const labels = phoneChoiceLabels(type, phoneSource, phoneFallbackAllowed);

	return (
		<div className="space-y-6">
			<div className="space-y-4 rounded-lg border p-4">
				<p className="text-sm">
					Sending to{' '}
					<span className="font-medium">
						{count} recipient{count === 1 ? '' : 's'}
					</span>
					{channel && (
						<>
							{' '}
							via <span className="font-medium">{channel.toUpperCase()}</span>
						</>
					)}
					{labels.target !== null && ` ${labels.target}`}.
				</p>

				{channel && (
					<div className="border-t pt-4 text-sm">
						{!preview && !previewError && <div className="bg-muted h-4 w-48 animate-pulse rounded" />}
						{previewError && (
							<p className="text-destructive">Couldn&apos;t calculate the delivery breakdown: {previewError}</p>
						)}
						{preview && (
							<dl className="space-y-2">
								<div className="flex items-center justify-between gap-4">
									<dt className="text-muted-foreground">Delivered via {channel.toUpperCase()}</dt>
									<dd className="font-medium tabular-nums">{preview.primary}</dd>
								</div>
								{preview.fallback > 0 && (
									<div className="flex items-center justify-between gap-4">
										<dt className="text-muted-foreground">Falling back to {otherChannel}</dt>
										<dd className="font-medium tabular-nums">{preview.fallback}</dd>
									</div>
								)}
								{preview.skippedNoPhone > 0 && (
									<div className="flex items-center justify-between gap-4">
										<dt className="text-warning">{labels.skipped}</dt>
										<dd className="text-warning font-medium tabular-nums">{preview.skippedNoPhone}</dd>
									</div>
								)}
							</dl>
						)}
					</div>
				)}
			</div>

			<div className="space-y-2">
				<h4 className="text-sm font-medium">Message preview</h4>
				{body ? (
					<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{rendered}</pre>
				) : (
					<p className="text-muted-foreground text-sm">This template has no message body.</p>
				)}
			</div>
		</div>
	);
};
