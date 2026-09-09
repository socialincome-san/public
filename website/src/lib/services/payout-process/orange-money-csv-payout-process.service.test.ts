import { type PrismaClient } from '@/generated/prisma/client';
import { OrangeMoneyCsvPayoutProcessService } from './orange-money-csv-payout-process.service';
import type { PayoutProcessCoreService } from './payout-process-core.service';
import type { PayoutRecipient } from './payout-process.types';

jest.mock('@/generated/prisma/client', () => ({
	CountryCode: { LR: 'LR', SL: 'SL' },
	PayoutProcess: { orange_money_csv: 'orange_money_csv', telecel_csv: 'telecel_csv' },
	PrismaClient: class {},
}));

const createRecipient = (payoutCountryCode: 'LR' | 'SL', phoneNumber: string): PayoutRecipient => ({
	id: `recipient-${payoutCountryCode}`,
	contact: { firstName: 'Amie', lastName: 'Kamara' },
	paymentInformation: {
		code: 'PI-1',
		phone: { number: phoneNumber },
		mobileMoneyProvider: { name: `Orange Money ${payoutCountryCode}` },
	},
	program: {
		payoutPerInterval: 6500,
		payoutCurrency: 'LRD',
		payoutCountryCode,
		programDurationInMonths: 36,
	},
	payouts: [],
});

const service = new OrangeMoneyCsvPayoutProcessService({} as PrismaClient, {} as PayoutProcessCoreService);

describe('OrangeMoneyCsvPayoutProcessService phone formatting', () => {
	it('exports the last 8 digits for Sierra Leone', () => {
		const csv = service.buildRegistrationCsv([createRecipient('SL', '+23231000001')]);

		expect(csv.split('\n')[1]).toBe('31000001,PI-1,subscriber');
	});

	it('exports the last 9 digits with a leading 0 for Liberia', () => {
		const csv = service.buildRegistrationCsv([createRecipient('LR', '+231770000001')]);

		expect(csv.split('\n')[1]).toBe('0770000001,PI-1,subscriber');
	});

	it('applies the Liberia format to the payout CSV as well', () => {
		const csv = service.buildPayoutCsv([createRecipient('LR', '+231770000001')], new Date('2026-08-01T12:00:00.000Z'));

		expect(csv.split('\n')[1]).toBe('0770000001,6500,Amie,Kamara,PI-1,Social Income August 2026,subscriber');
	});

	it('keeps the NO_PHONE placeholder when no phone is set', () => {
		const recipient = createRecipient('LR', '');
		recipient.paymentInformation!.phone = null;

		const csv = service.buildRegistrationCsv([recipient]);

		expect(csv.split('\n')[1]).toBe('NO_PHONE,PI-1,subscriber');
	});
});
