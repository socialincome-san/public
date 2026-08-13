import { formatQrBillIban, formatQrBillReference } from './qr-bill-format';

describe('formatQrBillIban', () => {
	it('groups the IBAN in blocks of four', () => {
		expect(formatQrBillIban('CH6730000001151126386')).toBe('CH67 3000 0001 1511 2638 6');
	});
});

describe('formatQrBillReference', () => {
	it('formats a 27-digit QR reference as 2 digits then groups of 5', () => {
		expect(formatQrBillReference('000173568960000017317000009')).toBe('00 01735 68960 00001 73170 00009');
	});
});
