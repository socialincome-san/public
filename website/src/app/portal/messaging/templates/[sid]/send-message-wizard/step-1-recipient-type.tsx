'use client';

import type { MessagingChannel } from '@/generated/prisma/client';
import type { MessagingPhoneSource, MessagingRecipientType } from '@/modules/messaging/messaging.types';
import { Checkbox } from '@socialincome/design-system/forms/checkbox/checkbox';
import { SelectableCard } from '@socialincome/design-system/forms/selectable-card/selectable-card';
import { useTranslations } from 'next-intl';

const TYPE_OPTIONS: {
	value: MessagingRecipientType;
	labelKey: 'wizard.recipientTypes.contributor' | 'wizard.recipientTypes.recipient' | 'wizard.recipientTypes.localPartner';
}[] = [
	{ value: 'contributor', labelKey: 'wizard.recipientTypes.contributor' },
	{ value: 'recipient', labelKey: 'wizard.recipientTypes.recipient' },
	{ value: 'local-partner', labelKey: 'wizard.recipientTypes.localPartner' },
];

const CHANNEL_OPTIONS: { value: MessagingChannel; labelKey: 'common.channels.sms' | 'common.channels.whatsapp' }[] = [
	{ value: 'sms', labelKey: 'common.channels.sms' },
	{ value: 'whatsapp', labelKey: 'common.channels.whatsapp' },
];

const PHONE_OPTIONS: {
	value: MessagingPhoneSource;
	labelKey: 'wizard.phone.contact' | 'wizard.phone.payment';
	hintKey: 'wizard.phone.contactHint' | 'wizard.phone.paymentHint';
}[] = [
	{ value: 'contact', labelKey: 'wizard.phone.contact', hintKey: 'wizard.phone.contactHint' },
	{ value: 'payment', labelKey: 'wizard.phone.payment', hintKey: 'wizard.phone.paymentHint' },
];

type Props = {
	type: MessagingRecipientType | null;
	channel: MessagingChannel | null;
	supportedChannels: MessagingChannel[];
	phoneSource: MessagingPhoneSource;
	phoneFallbackAllowed: boolean;
	onTypeChange: (next: MessagingRecipientType | null) => void;
	onChannelChange: (next: MessagingChannel) => void;
	onPhoneSourceChange: (next: MessagingPhoneSource) => void;
	onPhoneFallbackAllowedChange: (next: boolean) => void;
};

export const Step1RecipientType = ({
	type,
	channel,
	supportedChannels,
	phoneSource,
	phoneFallbackAllowed,
	onTypeChange,
	onChannelChange,
	onPhoneSourceChange,
	onPhoneFallbackAllowedChange,
}: Props) => {
	const t = useTranslations('portal-messaging');

	return (
		<div className="space-y-6">
			<section className="space-y-2">
				<h3 className="text-sm font-medium">{t('wizard.recipientType')}</h3>
				<div className="grid grid-cols-3 gap-3">
					{TYPE_OPTIONS.map((option) => (
						<SelectableCard
							key={option.value}
							selected={type === option.value}
							onSelect={() => onTypeChange(option.value)}
							size="sm"
						>
							{t(option.labelKey)}
						</SelectableCard>
					))}
				</div>
			</section>

			{type === 'recipient' && (
				<section className="space-y-2">
					<h3 className="text-sm font-medium">{t('wizard.phone.title')}</h3>
					<div className="grid grid-cols-2 gap-3">
						{PHONE_OPTIONS.map((option) => (
							<div key={option.value} className="space-y-1">
								<SelectableCard
									selected={phoneSource === option.value}
									onSelect={() => onPhoneSourceChange(option.value)}
									size="sm"
								>
									{t(option.labelKey)}
								</SelectableCard>
								<p className="text-muted-foreground text-center text-xs">{t(option.hintKey)}</p>
							</div>
						))}
					</div>
					<label className="flex items-center gap-2 pt-1 text-sm">
						<Checkbox
							checked={phoneFallbackAllowed}
							onCheckedChange={(checked) => onPhoneFallbackAllowedChange(checked === true)}
						/>
						<span>{t('wizard.phone.fallbackAllowed')}</span>
					</label>
				</section>
			)}

			<section className="space-y-2">
				<h3 className="text-sm font-medium">{t('wizard.channel')}</h3>
				<div className="grid grid-cols-2 gap-3">
					{CHANNEL_OPTIONS.map((option) => {
						const supported = supportedChannels.includes(option.value);

						return (
							<div key={option.value} className="space-y-1">
								<SelectableCard
									selected={channel === option.value}
									disabled={!supported}
									onSelect={() => onChannelChange(option.value)}
									size="sm"
								>
									{t(option.labelKey)}
								</SelectableCard>
								{!supported && (
									<p className="text-muted-foreground text-center text-xs">{t('wizard.channelNotAvailable')}</p>
								)}
							</div>
						);
					})}
				</div>
			</section>
		</div>
	);
};
