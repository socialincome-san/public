import type {
	MessagingPhoneSource,
	MessagingRecipientType,
} from '@/lib/services/twilio/messaging/recipients/recipients.types';

const PHONE_WORDS: Record<MessagingPhoneSource, string> = { contact: 'contact phone', payment: 'payment phone' };

export type PhoneChoiceLabels = {
	// Appended to "Sending to N recipients via SMS", e.g. "on their payment phone".
	target: string | null;
	skipped: string;
};

// Wording for the review step. Only recipients have two phones; every other type keeps the generic copy.
export const phoneChoiceLabels = (
	type: MessagingRecipientType | null,
	phoneSource: MessagingPhoneSource,
	phoneFallbackAllowed: boolean,
): PhoneChoiceLabels => {
	if (type !== 'recipient') {
		return { target: null, skipped: 'Skipped — no phone number' };
	}
	const chosen = PHONE_WORDS[phoneSource];

	return {
		target: `on their ${chosen}`,
		skipped: phoneFallbackAllowed ? 'Skipped — no phone number' : `Skipped — no ${chosen} number`,
	};
};
