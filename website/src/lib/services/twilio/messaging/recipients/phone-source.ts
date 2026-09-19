import type { MessagingPhone, MessagingPhoneSource, MessagingRecipientType } from './recipients.types';

export const PAYMENT_PHONE_ONLY_FOR_RECIPIENTS = 'Payment phone is only available for recipients';

// Only recipients have a payment phone; every other type is limited to the contact phone.
export const isPhoneSourceAllowed = (type: MessagingRecipientType, source: MessagingPhoneSource): boolean =>
	source !== 'payment' || type === 'recipient';

export type PickTargetPhoneInput = {
	source: MessagingPhoneSource;
	fallback: boolean;
	contactPhone: MessagingPhone | null;
	paymentPhone: MessagingPhone | null;
};

// Anything other than 'payment' is treated as the contact phone so an unexpected value from the
// client keeps today's behaviour instead of silently targeting the payment phone.
export function pickTargetPhone({
	source,
	fallback,
	contactPhone,
	paymentPhone,
}: PickTargetPhoneInput): MessagingPhone | null {
	const [primary, other] = source === 'payment' ? [paymentPhone, contactPhone] : [contactPhone, paymentPhone];

	return primary ?? (fallback ? other : null);
}
