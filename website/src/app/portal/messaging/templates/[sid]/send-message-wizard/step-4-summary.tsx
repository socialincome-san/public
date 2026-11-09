'use client';

import type { MessagingChannel } from '@/generated/prisma/client';
import { previewMessagingChannelAction } from '@/modules/messaging/messaging.actions';
import type {
	ChannelPreviewSummary,
	MessagingPhoneSource,
	MessagingRecipientType,
	ParsedVariable,
	SelectionState,
	VariableAssignments,
} from '@/modules/messaging/messaging.types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { phoneChoiceLabels } from './phone-labels';
import { renderTemplatePreview } from './render-template-preview';
import { getSelectedCount } from './selection';

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
	const t = useTranslations('portal-messaging');
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

	const otherChannel = channel === 'whatsapp' ? t('common.channels.sms') : t('common.channels.whatsapp');
	const channelLabel =
		channel === 'sms' ? t('common.channels.sms') : channel === 'whatsapp' ? t('common.channels.whatsapp') : '';
	const labels = phoneChoiceLabels(type, phoneSource, phoneFallbackAllowed, {
		contact: t('wizard.phone.contactShort'),
		payment: t('wizard.phone.paymentShort'),
		skipped: t('wizard.review.skippedNoPhone'),
		skippedFor: (phone) => t('wizard.review.skippedNoPhoneFor', { phone }),
		onPhone: (phone) => t('wizard.review.onPhone', { phone }),
	});

	return (
		<div className="space-y-6">
			<div className="space-y-4 rounded-lg border p-4">
				<p className="text-sm">
					{t('wizard.review.sendingTo', { count })}{' '}
					<span className="font-medium">{channel ? `${t('common.via')} ${channelLabel}` : ''}</span>
					{channel && <>{labels.target && ` ${labels.target}`}</>}.
				</p>

				{channel && (
					<div className="border-t pt-4 text-sm">
						{!preview && !previewError && <div className="bg-muted h-4 w-48 animate-pulse rounded" />}
						{previewError && (
							<p className="text-destructive">{t('wizard.review.breakdownError', { error: previewError })}</p>
						)}
						{preview && (
							<dl className="space-y-2">
								<div className="flex items-center justify-between gap-4">
									<dt className="text-muted-foreground">{t('wizard.review.deliveredVia', { channel: channelLabel })}</dt>
									<dd className="font-medium tabular-nums">{preview.primary}</dd>
								</div>
								{preview.fallback > 0 && (
									<div className="flex items-center justify-between gap-4">
										<dt className="text-muted-foreground">{t('wizard.review.fallingBackTo', { channel: otherChannel })}</dt>
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
				<h4 className="text-sm font-medium">{t('wizard.review.messagePreview')}</h4>
				{body ? (
					<pre className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{rendered}</pre>
				) : (
					<p className="text-muted-foreground text-sm">{t('common.noBody')}</p>
				)}
			</div>
		</div>
	);
};
