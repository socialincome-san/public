import {
	CountryCode,
	Currency,
	PayoutInterval,
	PayoutProcess,
	PayoutStatus,
	ProgramPermission,
} from '@/generated/prisma/enums';
import { getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import {
	getMobileMoneyProviderPayoutProcess,
	getPayoutProcessOverviewOptions,
} from '@/modules/mobile-money-providers/mobile-money-provider.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import { isReadyForFirstPayoutInterval } from '@/modules/programs/program-stats.service';
import { getPayoutProcessRecipients, recipientStatusService } from '@/modules/recipients/recipient.service';
import type { PayoutProcessRecipient } from '@/modules/recipients/recipient.types';
import {
	buildOrangePayoutCsv,
	buildOrangeRegistrationCsv,
	buildTelecelPayoutCsv,
	getPayoutRecipientCounts,
	previewOrangeCurrentMonthPayouts,
} from './payout-process.service';

jest.mock('@/modules/exchange-rates/exchange-rate.service', () => ({
	getLatestRates: jest.fn(),
}));
jest.mock('@/modules/mobile-money-providers/mobile-money-provider.service', () => ({
	getMobileMoneyProviderIdsByPayoutProcess: jest.fn(),
	getMobileMoneyProviderPayoutProcess: jest.fn(),
	getPayoutProcessOverviewOptions: jest.fn(),
}));
jest.mock('@/modules/payouts/payout.service', () => ({
	createPayoutProcessPayouts: jest.fn(),
}));
jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: jest.fn(),
}));
jest.mock('@/modules/programs/program-stats.service', () => ({
	isReadyForFirstPayoutInterval: jest.fn(),
}));
jest.mock('@/modules/recipients/recipient.service', () => ({
	getPayoutProcessRecipients: jest.fn(),
	recipientStatusService: {
		countPaidOrConfirmedPayouts: jest.fn(),
		isRecipientEligibleForPayout: jest.fn(),
	},
}));

const createRecipient = (
	payoutCountryCode: CountryCode,
	phoneNumber: string | null,
	payouts: PayoutProcessRecipient['payouts'] = [],
): PayoutProcessRecipient => ({
	id: `recipient-${payoutCountryCode}-${phoneNumber ?? 'none'}`,
	startDate: new Date('2025-01-01T12:00:00.000Z'),
	suspendedAt: null,
	contact: { firstName: 'Amie', lastName: 'Kamara' },
	paymentInformation: {
		code: 'PI-1',
		phone: phoneNumber ? { number: phoneNumber } : null,
		mobileMoneyProvider: { name: 'Orange Money' },
	},
	program: {
		payoutPerInterval: 6500,
		payoutCurrency: Currency.LRD,
		payoutCountryCode,
		programDurationInMonths: 36,
		payoutInterval: PayoutInterval.monthly,
	},
	payouts,
});

describe('payout process CSV formatting', () => {
	it('exports the last 8 digits for Sierra Leone Orange Money registration', () => {
		const result = buildOrangeRegistrationCsv([createRecipient(CountryCode.SL, '+23231000001')]);

		expect(result).toEqual(expect.objectContaining({ success: true }));
		if (result.success) {
			expect(result.data.split('\n')[1]).toBe('31000001,PI-1,subscriber');
		}
	});

	it('exports a Liberia Orange Money number with a leading zero', () => {
		const result = buildOrangeRegistrationCsv([createRecipient(CountryCode.LR, '+231770000001')]);

		expect(result).toEqual(expect.objectContaining({ success: true }));
		if (result.success) {
			expect(result.data.split('\n')[1]).toBe('0770000001,PI-1,subscriber');
		}
	});

	it('preserves Orange Money payout columns and remarks', () => {
		const result = buildOrangePayoutCsv(
			[createRecipient(CountryCode.LR, '+231770000001')],
			new Date('2026-08-01T12:00:00.000Z'),
		);

		expect(result).toEqual(expect.objectContaining({ success: true }));
		if (result.success) {
			expect(result.data.split('\n')[1]).toBe('0770000001,6500,Amie,Kamara,PI-1,Social Income August 2026,subscriber');
		}
	});

	it('keeps the Orange Money NO_PHONE placeholder', () => {
		const result = buildOrangeRegistrationCsv([createRecipient(CountryCode.LR, null)]);

		expect(result).toEqual(expect.objectContaining({ success: true }));
		if (result.success) {
			expect(result.data.split('\n')[1]).toBe('NO_PHONE,PI-1,subscriber');
		}
	});

	it('formats Telecel MSISDN, amount, and provider columns', () => {
		const result = buildTelecelPayoutCsv([createRecipient(CountryCode.SL, '+23231000001')]);

		expect(result).toEqual(expect.objectContaining({ success: true }));
		if (result.success) {
			expect(result.data).toBe('MSISDN,Amount,Telco\n23231000001,6500,Orange Money');
		}
	});
});

describe('payout process orchestration', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.mocked(getMobileMoneyProviderPayoutProcess).mockResolvedValue({
			success: true,
			data: PayoutProcess.orange_money_csv,
		});
		jest.mocked(getAccessiblePrograms).mockResolvedValue({
			success: true,
			data: [
				{
					programId: 'program-1',
					programName: 'Program',
					permission: ProgramPermission.operator,
				},
			],
		});
		jest.mocked(isReadyForFirstPayoutInterval).mockResolvedValue({ success: true, data: true });
		jest.mocked(recipientStatusService.countPaidOrConfirmedPayouts).mockReturnValue({
			success: true,
			data: 0,
		});
		jest.mocked(recipientStatusService.isRecipientEligibleForPayout).mockReturnValue({
			success: true,
			data: true,
		});
	});

	it('counts only recipients without a payout in the selected month', async () => {
		const selectedDate = new Date('2026-08-15T12:00:00.000Z');
		jest.mocked(getPayoutProcessOverviewOptions).mockResolvedValue({
			success: true,
			data: [
				{
					kind: 'mobile_money_provider',
					id: 'orange-1',
					name: 'Orange Money',
					payoutProcess: PayoutProcess.orange_money_csv,
				},
			],
		});
		jest.mocked(getPayoutProcessRecipients).mockResolvedValue({
			success: true,
			data: [
				createRecipient(CountryCode.SL, '+23231000001'),
				createRecipient(CountryCode.SL, '+23231000002', [
					{ paymentAt: new Date('2026-08-01T12:00:00.000Z'), status: PayoutStatus.paid },
				]),
			],
		});

		await expect(getPayoutRecipientCounts('user-1', { selectedDate })).resolves.toEqual({
			success: true,
			data: { 'orange-1': 1 },
			status: undefined,
		});
	});

	it('converts preview amounts to CHF using the latest rates', async () => {
		const selectedDate = new Date('2026-08-15T12:00:00.000Z');
		jest.mocked(getPayoutProcessRecipients).mockResolvedValue({
			success: true,
			data: [createRecipient(CountryCode.LR, '+231770000001')],
		});
		jest.mocked(getLatestRates).mockResolvedValue({
			success: true,
			data: { [Currency.LRD]: 200, [Currency.CHF]: 1 },
		});

		const result = await previewOrangeCurrentMonthPayouts('user-1', {
			mobileMoneyProviderId: 'orange-1',
			selectedDate,
		});

		expect(result).toEqual(expect.objectContaining({ success: true }));
		if (result.success) {
			expect(result.data[0]?.amountChf).toBe(32.5);
		}
	});
});
