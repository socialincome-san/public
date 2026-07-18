import { MessagingChannel } from '@/generated/prisma/client';

export type ResolveChannelInput = {
	requested: MessagingChannel;
	phoneNumber: string | null;
	hasWhatsApp: boolean;
};

export type ResolveChannelOutput = {
	channelUsed: MessagingChannel | null;
	fellBack: boolean;
	skippedReason: 'no_phone' | 'no_channel_available' | null;
};

export function resolveChannel({ requested, phoneNumber, hasWhatsApp }: ResolveChannelInput): ResolveChannelOutput {
	if (!phoneNumber) {
		return { channelUsed: null, fellBack: false, skippedReason: 'no_phone' };
	}

	if (requested === 'whatsapp' && !hasWhatsApp) {
		return { channelUsed: 'sms', fellBack: true, skippedReason: null };
	}

	return { channelUsed: requested, fellBack: false, skippedReason: null };
}
