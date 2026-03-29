'use client';

import { Label } from '@/components/label';
import { RadioGroup, RadioGroupItem } from '@/components/radio-group';
import { MessageChannel } from '@/generated/prisma/enums';

const channelOptions: { value: MessageChannel; label: string; description: string }[] = [
	{ value: MessageChannel.sms, label: 'SMS', description: 'Send via Twilio SMS' },
	{ value: MessageChannel.whatsapp, label: 'WhatsApp', description: 'Send via Twilio WhatsApp' },
	{ value: MessageChannel.email, label: 'Email', description: 'Send via SendGrid' },
];

type StepSelectChannelProps = {
	channel: MessageChannel | null;
	onChannelChange: (channel: MessageChannel) => void;
};

export default function StepSelectChannel({ channel, onChannelChange }: StepSelectChannelProps) {
	return (
		<div className="space-y-4">
			<Label className="mb-2 block text-sm font-medium">Message Channel</Label>
			<RadioGroup value={channel ?? undefined} onValueChange={(value) => onChannelChange(value as MessageChannel)}>
				{channelOptions.map((option) => (
					<div key={option.value} className="flex items-center space-x-2">
						<RadioGroupItem value={option.value} id={`channel-${option.value}`} />
						<Label htmlFor={`channel-${option.value}`}>
							{option.label}
							<span className="text-muted-foreground ml-2 text-xs">{option.description}</span>
						</Label>
					</div>
				))}
			</RadioGroup>
		</div>
	);
}
