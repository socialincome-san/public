import { type PrismaClient } from '@/generated/prisma/client';
import type { ServiceResult } from '../core/base.types';
import type { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import type { ProgramAccessReadService } from '../program-access/program-access-read.service';
import type { RecipientStatusService } from '../recipient/recipient-status.service';
import { PAYOUT_FORECAST_MONTHS_AHEAD } from './payout-forecast.constants';
import { PayoutReadService } from './payout-read.service';

jest.mock('@/generated/prisma/client', () => ({
	PayoutStatus: { confirmed: 'confirmed', paid: 'paid' },
	PrismaClient: class {},
	ProgramPermission: { operator: 'operator', owner: 'owner' },
}));
jest.mock('@/generated/prisma/enums', () => ({
	CountryCode: {},
}));
jest.mock('@/lib/utils/now', () => ({
	now: () => new Date('2025-06-15T12:00:00.000Z'),
}));

type MockProgramDelegate = {
	findUnique: jest.Mock;
};

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: ServiceResult<unknown>, error: string) => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}
	expect(result.error).toBe(error);
};

const baseProgram = {
	programDurationInMonths: 12,
	payoutPerInterval: 800,
	payoutInterval: 'monthly',
	country: {
		currency: 'SLE',
	},
	recipients: [] as {
		startDate: Date | null;
		suspendedAt: Date | null;
		payouts: { id: string }[];
	}[],
};

const createService = ({
	program = baseProgram,
	exchangeRates = { SLE: 24, USD: 1 },
	isEligible = true,
	accessiblePrograms = [{ programId: 'program-1', permission: 'owner' as const }],
	accessError,
}: {
	program?: typeof baseProgram | null;
	exchangeRates?: Record<string, number>;
	isEligible?: boolean;
	accessiblePrograms?: { programId: string; permission: 'owner' | 'operator' }[];
	accessError?: string;
} = {}) => {
	const findUnique = jest.fn().mockResolvedValue(program);
	const db = {
		program: {
			findUnique,
		} satisfies MockProgramDelegate,
	};

	const programAccessService = {
		getAccessiblePrograms: jest
			.fn()
			.mockResolvedValue(
				accessError ? { success: false as const, error: accessError } : { success: true as const, data: accessiblePrograms },
			),
	} as unknown as ProgramAccessReadService;

	const exchangeRateService = {
		getLatestRates: jest.fn().mockResolvedValue({ success: true as const, data: exchangeRates }),
	} as unknown as ExchangeRateReadService;

	const recipientStatusService = {
		isRecipientEligibleForPayout: jest.fn().mockReturnValue({ success: true as const, data: isEligible }),
	} as unknown as RecipientStatusService;

	const service = new PayoutReadService(
		db as unknown as PrismaClient,
		programAccessService,
		exchangeRateService,
		recipientStatusService,
	);

	return { service, findUnique, recipientStatusService, programAccessService };
};

describe('PayoutReadService payout forecast', () => {
	test('getPublicForecastTableView returns program not found when program is missing', async () => {
		const { service } = createService({ program: null });

		const result = await service.getPublicForecastTableView('missing-program', PAYOUT_FORECAST_MONTHS_AHEAD);

		expectFailure(result, 'Program not found');
	});

	test('getPublicForecastTableView returns missing exchange rate when currency rate is absent', async () => {
		const { service } = createService({ exchangeRates: { USD: 1 } });

		const result = await service.getPublicForecastTableView('program-1', PAYOUT_FORECAST_MONTHS_AHEAD);

		expectFailure(result, 'Missing exchange rate');
	});

	test('getPublicForecastTableView counts eligible recipients across forecast months', async () => {
		const { service } = createService({
			program: {
				...baseProgram,
				recipients: [
					{
						startDate: new Date('2025-01-01T00:00:00.000Z'),
						suspendedAt: null,
						payouts: [{ id: 'payout-1' }],
					},
					{
						startDate: new Date('2025-01-01T00:00:00.000Z'),
						suspendedAt: null,
						payouts: [],
					},
				],
			},
		});

		const result = await service.getPublicForecastTableView('program-1', PAYOUT_FORECAST_MONTHS_AHEAD);
		const data = expectSuccess(result);

		expect(data.tableRows).toHaveLength(PAYOUT_FORECAST_MONTHS_AHEAD + 1);
		expect(data.tableRows[0]).toMatchObject({
			period: '2025-06',
			numberOfRecipients: 2,
			amountInProgramCurrency: 1600,
			programCurrency: 'SLE',
		});
		expect(data.tableRows[0]?.amountUsd).toBeCloseTo(66.67, 1);
	});

	test('getPublicForecastTableView excludes ineligible recipients', async () => {
		const { service, recipientStatusService } = createService({
			program: {
				...baseProgram,
				recipients: [
					{
						startDate: new Date('2025-01-01T00:00:00.000Z'),
						suspendedAt: null,
						payouts: [],
					},
				],
			},
			isEligible: false,
		});

		const result = await service.getPublicForecastTableView('program-1', PAYOUT_FORECAST_MONTHS_AHEAD);
		const data = expectSuccess(result);

		expect(recipientStatusService.isRecipientEligibleForPayout).toHaveBeenCalled();
		expect(data.tableRows.every((row) => row.numberOfRecipients === 0)).toBe(true);
	});

	test('getForecastTableView denies access when user has no program access', async () => {
		const { service } = createService({ accessiblePrograms: [] });

		const result = await service.getForecastTableView('user-1', 'program-1', PAYOUT_FORECAST_MONTHS_AHEAD);

		expectFailure(result, 'Access denied for this program');
	});

	test('getForecastTableView returns forecast when user has program access', async () => {
		const { service } = createService({
			program: {
				...baseProgram,
				recipients: [
					{
						startDate: new Date('2025-01-01T00:00:00.000Z'),
						suspendedAt: null,
						payouts: [],
					},
				],
			},
		});

		const result = await service.getForecastTableView('user-1', 'program-1', PAYOUT_FORECAST_MONTHS_AHEAD);
		const data = expectSuccess(result);

		expect(data.tableRows[0]?.numberOfRecipients).toBe(1);
	});
});
