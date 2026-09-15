'use client';

import { Checkbox } from '@/components/checkbox/checkbox';
import { SelectableCard } from '@/components/selectable-card';
import type { MessagingChannel } from '@/generated/prisma/client';
import type {
	MessagingPhoneSource,
	MessagingRecipientType,
} from '@/lib/services/twilio/messaging/recipients/recipients.types';

const TYPE_OPTIONS: { value: MessagingRecipientType; label: string }[] = [
	{ value: 'contributor', label: 'Contributor' },
	{ value: 'recipient', label: 'Recipient' },
	{ value: 'local-partner', label: 'Local partner' },
];

const CHANNEL_OPTIONS: { value: MessagingChannel; label: string }[] = [
	{ value: 'sms', label: 'SMS' },
	{ value: 'whatsapp', label: 'WhatsApp' },
];

const PHONE_OPTIONS: { value: MessagingPhoneSource; label: string; hint: string }[] = [
	{ value: 'contact', label: 'Contact phone', hint: 'Number used for communication' },
	{ value: 'payment', label: 'Payment phone', hint: 'Mobile money number used for payouts' },
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
	return (
		<div className="space-y-6">
			<section className="space-y-2">
				<h3 className="text-sm font-medium">Recipient type</h3>
				<div className="grid grid-cols-3 gap-3">
					{TYPE_OPTIONS.map((option) => (
						<SelectableCard
							key={option.value}
							selected={type === option.value}
							onSelect={() => onTypeChange(option.value)}
							className="px-4 py-3 text-center text-sm font-medium"
						>
							{option.label}
						</SelectableCard>
					))}
				</div>
			</section>

			{type === 'recipient' && (
				<section className="space-y-2">
					<h3 className="text-sm font-medium">Phone number</h3>
					<div className="grid grid-cols-2 gap-3">
						{PHONE_OPTIONS.map((option) => (
							<div key={option.value} className="space-y-1">
								<SelectableCard
									selected={phoneSource === option.value}
									onSelect={() => onPhoneSourceChange(option.value)}
									className="w-full px-4 py-3 text-center text-sm font-medium"
								>
									{option.label}
								</SelectableCard>
								<p className="text-muted-foreground text-center text-xs">{option.hint}</p>
							</div>
						))}
					</div>
					<label className="flex items-center gap-2 pt-1 text-sm">
						<Checkbox
							checked={phoneFallbackAllowed}
							onCheckedChange={(checked) => onPhoneFallbackAllowedChange(checked === true)}
						/>
						<span>Use the other phone when the chosen one is missing</span>
					</label>
				</section>
			)}

			<section className="space-y-2">
				<h3 className="text-sm font-medium">Channel</h3>
				<div className="grid grid-cols-2 gap-3">
					{CHANNEL_OPTIONS.map((option) => {
						const supported = supportedChannels.includes(option.value);

						return (
							<div key={option.value} className="space-y-1">
								<SelectableCard
									selected={channel === option.value}
									disabled={!supported}
									onSelect={() => onChannelChange(option.value)}
									className="w-full px-4 py-3 text-center text-sm font-medium"
								>
									{option.label}
								</SelectableCard>
								{!supported && <p className="text-muted-foreground text-center text-xs">Not available for this template</p>}
							</div>
						);
					})}
				</div>
			</section>
		</div>
	);
};
