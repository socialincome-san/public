'use client';

import { Label } from '@/components/label';
import { MessageChannel } from '@/generated/prisma/enums';

type StepEnterContactsProps = {
	channel: MessageChannel;
	contactsText: string;
	onContactsTextChange: (text: string) => void;
};

const getLabel = (channel: MessageChannel): string => {
	switch (channel) {
		case MessageChannel.email:
			return 'Email addresses';
		case MessageChannel.sms:
		case MessageChannel.whatsapp:
			return 'Phone numbers';
	}
};

const getPlaceholder = (channel: MessageChannel): string => {
	switch (channel) {
		case MessageChannel.email:
			return 'one@example.com\ntwo@example.com';
		case MessageChannel.sms:
		case MessageChannel.whatsapp:
			return '+1234567890\n+0987654321';
	}
};

export const parseContacts = (text: string): string[] => {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
};

export default function StepEnterContacts({ channel, contactsText, onContactsTextChange }: StepEnterContactsProps) {
	const contacts = parseContacts(contactsText);

	return (
		<div className="space-y-4">
			<div>
				<Label htmlFor="contacts-input" className="mb-2 block text-sm font-medium">
					{getLabel(channel)}
				</Label>
				<textarea
					id="contacts-input"
					className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					placeholder={getPlaceholder(channel)}
					value={contactsText}
					onChange={(e) => onContactsTextChange(e.target.value)}
					rows={6}
				/>
			</div>
			{contacts.length > 0 && (
				<p className="text-muted-foreground text-sm">
					{contacts.length} contact{contacts.length !== 1 ? 's' : ''} entered
				</p>
			)}
		</div>
	);
}
