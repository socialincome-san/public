import { resolveChannel } from './channel-resolver';

describe('resolveChannel', () => {
	test('skips when no phone number', () => {
		expect(resolveChannel({ requested: 'sms', phoneNumber: null, hasWhatsApp: false })).toEqual({
			channelUsed: null,
			fellBack: false,
			skippedReason: 'no_phone',
		});
	});

	test('sms requested, phone present: uses sms', () => {
		expect(resolveChannel({ requested: 'sms', phoneNumber: '+41791234567', hasWhatsApp: false })).toEqual({
			channelUsed: 'sms',
			fellBack: false,
			skippedReason: null,
		});
	});

	test('sms requested, phone present, has whatsapp: still uses sms', () => {
		expect(resolveChannel({ requested: 'sms', phoneNumber: '+41791234567', hasWhatsApp: true })).toEqual({
			channelUsed: 'sms',
			fellBack: false,
			skippedReason: null,
		});
	});

	test('whatsapp requested, has whatsapp: uses whatsapp', () => {
		expect(resolveChannel({ requested: 'whatsapp', phoneNumber: '+41791234567', hasWhatsApp: true })).toEqual({
			channelUsed: 'whatsapp',
			fellBack: false,
			skippedReason: null,
		});
	});

	test('whatsapp requested, no whatsapp: falls back to sms', () => {
		expect(resolveChannel({ requested: 'whatsapp', phoneNumber: '+41791234567', hasWhatsApp: false })).toEqual({
			channelUsed: 'sms',
			fellBack: true,
			skippedReason: null,
		});
	});

	test('whatsapp requested, no phone: skipped with no_phone', () => {
		expect(resolveChannel({ requested: 'whatsapp', phoneNumber: null, hasWhatsApp: true })).toEqual({
			channelUsed: null,
			fellBack: false,
			skippedReason: 'no_phone',
		});
	});
});
