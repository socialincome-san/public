import type { MessagingPhoneSource, MessagingRecipientType } from '@/modules/messaging/messaging.types';

export type PhoneChoiceLabels = {
	target: string | null;
	skipped: string;
};

export const phoneChoiceLabels = (
	type: MessagingRecipientType | null,
	phoneSource: MessagingPhoneSource,
	phoneFallbackAllowed: boolean,
	words: {
		contact: string;
		payment: string;
		skipped: string;
		skippedFor: (phone: string) => string;
		onPhone: (phone: string) => string;
	},
): PhoneChoiceLabels => {
	if (type !== 'recipient') {
		return { target: null, skipped: words.skipped };
	}
	const chosen = words[phoneSource];

	return {
		target: words.onPhone(chosen),
		skipped: phoneFallbackAllowed ? words.skipped : words.skippedFor(chosen),
	};
};
