import { isPhoneSourceAllowed, pickTargetPhone } from './phone-source';
import type { MessagingPhone, MessagingPhoneSource } from './recipients.types';

const contactPhone: MessagingPhone = { number: '+41791111111', hasWhatsApp: true };
const paymentPhone: MessagingPhone = { number: '+41792222222', hasWhatsApp: false };

describe('pickTargetPhone', () => {
	test('contact source uses the contact phone', () => {
		expect(pickTargetPhone({ source: 'contact', fallback: false, contactPhone, paymentPhone })).toEqual(contactPhone);
	});

	test('payment source uses the payment phone', () => {
		expect(pickTargetPhone({ source: 'payment', fallback: false, contactPhone, paymentPhone })).toEqual(paymentPhone);
	});

	test('contact source, no contact phone, no fallback: no phone', () => {
		expect(pickTargetPhone({ source: 'contact', fallback: false, contactPhone: null, paymentPhone })).toBeNull();
	});

	test('payment source, no payment phone, no fallback: no phone', () => {
		expect(pickTargetPhone({ source: 'payment', fallback: false, contactPhone, paymentPhone: null })).toBeNull();
	});

	test('contact source, no contact phone, fallback on: uses the payment phone', () => {
		expect(pickTargetPhone({ source: 'contact', fallback: true, contactPhone: null, paymentPhone })).toEqual(paymentPhone);
	});

	test('payment source, no payment phone, fallback on: uses the contact phone', () => {
		expect(pickTargetPhone({ source: 'payment', fallback: true, contactPhone, paymentPhone: null })).toEqual(contactPhone);
	});

	test('fallback on, neither phone present: no phone', () => {
		expect(pickTargetPhone({ source: 'payment', fallback: true, contactPhone: null, paymentPhone: null })).toBeNull();
	});

	test('fallback is not used when the chosen phone exists', () => {
		expect(pickTargetPhone({ source: 'payment', fallback: true, contactPhone, paymentPhone })).toEqual(paymentPhone);
	});

	test('an unknown source behaves like the contact source', () => {
		const source = 'unexpected' as MessagingPhoneSource;
		expect(pickTargetPhone({ source, fallback: false, contactPhone, paymentPhone })).toEqual(contactPhone);
	});
});

describe('isPhoneSourceAllowed', () => {
	test('the contact phone is allowed for every recipient type', () => {
		expect(isPhoneSourceAllowed('contributor', 'contact')).toBe(true);
		expect(isPhoneSourceAllowed('recipient', 'contact')).toBe(true);
		expect(isPhoneSourceAllowed('local-partner', 'contact')).toBe(true);
	});

	test('the payment phone is only allowed for recipients', () => {
		expect(isPhoneSourceAllowed('recipient', 'payment')).toBe(true);
		expect(isPhoneSourceAllowed('contributor', 'payment')).toBe(false);
		expect(isPhoneSourceAllowed('local-partner', 'payment')).toBe(false);
	});
});
