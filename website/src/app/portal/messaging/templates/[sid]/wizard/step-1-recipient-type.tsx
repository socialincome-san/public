'use client';

import { SegmentedToggle } from '@/components/segmented-toggle';
import type { MessagingChannel } from '@/generated/prisma/client';
import type { MessagingRecipientType } from '@/lib/services/twilio/messaging/recipients.types';

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
	onTypeChange: (next: MessagingRecipientType | null) => void;
	onChannelChange: (next: MessagingChannel) => void;
};

export const Step1RecipientType = ({ type, channel, onTypeChange, onChannelChange }: Props) => {
	const handleTypeChange = (value: string) => {
		onTypeChange(value ? (value as MessagingRecipientType) : null);
	};

	const handleChannelChange = (value: string) => {
		if (value) {
			onChannelChange(value as MessagingChannel);
		}
	};

	return (
		<div className="space-y-6">
			<section className="space-y-3">
				<h3 className="text-sm font-medium">Select recipient type</h3>
				<SegmentedToggle value={type ?? ''} onValueChange={handleTypeChange} options={TYPE_OPTIONS} />
			</section>

			<section className="space-y-3">
				<h3 className="text-sm font-medium">Select channel</h3>
				<SegmentedToggle value={channel ?? ''} onValueChange={handleChannelChange} options={CHANNEL_OPTIONS} />
			</section>
		</div>
	);
};
