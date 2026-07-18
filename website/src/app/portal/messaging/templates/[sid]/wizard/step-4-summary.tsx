'use client';

import type { MessagingChannel } from '@/generated/prisma/client';
import { previewMessagingChannelAction } from '@/lib/server-actions/messaging-actions';
import type { MessagingRecipientType, SelectionState } from '@/lib/services/twilio/messaging/recipients.types';
import { getSelectedCount } from '@/lib/services/twilio/messaging/selection';
import type {
	ChannelPreviewSummary,
	ParsedVariable,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-messaging.types';
import { useEffect, useState } from 'react';
import { renderTemplatePreview } from './render-template-preview';

type Props = {
	body: string | null;
	variables: ParsedVariable[];
	assignments: VariableAssignments;
	selection: SelectionState;
	totalCount: number;
	type: MessagingRecipientType | null;
	channel: MessagingChannel | null;
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
	onPreviewLoaded,
}: Props) => {
	const count = getSelectedCount(selection, totalCount);
	const rendered = body ? renderTemplatePreview(body, variables, assignments) : '';
	const [preview, setPreview] = useState<ChannelPreviewSummary | null>(null);
	const [previewError, setPreviewError] = useState<string | null>(null);

	useEffect(() => {
		if (!type || !channel) {
			return;
		}
		let cancelled = false;
		setPreview(null);
		setPreviewError(null);
		previewMessagingChannelAction(type, selection, channel).then((result) => {
			if (cancelled) {
				return;
			}
			if (!result.success) {
				setPreviewError(result.error);

				return;
			}
			setPreview(result.data);
			onPreviewLoaded?.(result.data);
		});

		return () => {
			cancelled = true;
		};
	}, [type, channel, selection]);

	const fieldAssignments = variables
		.map((v) => ({ variable: v, assignment: assignments[v.key] }))
		.filter((entry) => entry.assignment?.source === 'field');

	return (
		<section className="space-y-3">
			<h3 className="text-sm font-medium">Summary</h3>
			<p className="text-sm">
				Will send to{' '}
				<span className="font-medium">
					{count} recipient{count === 1 ? '' : 's'}
				</span>
				.
			</p>

			{channel && (
				<div className="text-muted-foreground space-y-1 text-xs">
					{!preview && !previewError && <p>Calculating channel breakdown…</p>}
					{previewError && <p className="text-destructive">Preview failed: {previewError}</p>}
					{preview && (
						<>
							<p>
								<span className="font-medium">{preview.primary}</span> via {channel.toUpperCase()}
								{preview.fallback > 0 && (
									<>
										{', '}
										<span className="font-medium">{preview.fallback}</span> falling back to{' '}
										{channel === 'whatsapp' ? 'SMS' : 'WhatsApp'}
									</>
								)}
								{preview.skippedNoPhone > 0 && (
									<>
										{', '}
										<span className="font-medium">{preview.skippedNoPhone}</span> skipped (no phone)
									</>
								)}
							</p>
						</>
					)}
				</div>
			)}

			{body ? (
				<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{rendered}</pre>
			) : (
				<p className="text-muted-foreground text-sm">(no body)</p>
			)}
			{fieldAssignments.length > 0 && (
				<ul className="text-muted-foreground space-y-1 text-xs italic">
					{fieldAssignments.map(({ variable, assignment }) => (
						<li key={variable.key}>
							<span className="font-mono">{`{{${variable.key}}}`}</span> will use each recipient&apos;s{' '}
							<span className="font-mono">{assignment?.source === 'field' ? assignment.path : ''}</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
};
