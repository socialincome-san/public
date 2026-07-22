'use client';

import { SelectableCard } from '@/components/selectable-card';
import type { MessagingChannel } from '@/generated/prisma/client';
import type { MessagingRecipientType } from '@/lib/services/twilio/messaging/recipients/recipients.types';

const TYPE_OPTIONS: { value: MessagingRecipientType; label: string }[] = [
	{ value: 'contributor', label: 'Contributor' },
	{ value: 'recipient', label: 'Recipient' },
	{ value: 'local-partner', label: 'Local partner' },
];

const CHANNEL_OPTIONS: { value: MessagingChannel; label: string }[] = [
	{ value: 'sms', label: 'SMS' },
	{ value: 'whatsapp', label: 'WhatsApp' },
];

type Props = {
	type: MessagingRecipientType | null;
	channel: MessagingChannel | null;
	supportedChannels: MessagingChannel[];
	onTypeChange: (next: MessagingRecipientType | null) => void;
	onChannelChange: (next: MessagingChannel) => void;
};

export const Step1RecipientType = ({ type, channel, supportedChannels, onTypeChange, onChannelChange }: Props) => {
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
