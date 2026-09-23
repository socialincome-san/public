import { Currency, PayoutInterval, PayoutStatus, ProgramPermission } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';
import { PAYOUT_FORECAST_MONTHS_AHEAD } from './payout.types';

const mockGetAccessiblePrograms = jest.fn();
const mockGetLatestRates = jest.fn();
const mockGetProgramPayoutForecastSource = jest.fn();
const mockGetRecipientProgramAssignment = jest.fn();
const mockIsRecipientEligibleForPayout = jest.fn();
const mockFindPayout = jest.fn();
const mockFindPayoutForStatusUpdate = jest.fn();
const mockFindPayoutForUpdate = jest.fn();
const mockFindPayoutForDeletion = jest.fn();
const mockCreatePayout = jest.fn();
const mockUpdatePayout = jest.fn();
const mockUpdatePayoutStatus = jest.fn();
const mockDeletePayout = jest.fn();
const mockFindPaidOrConfirmedPayoutTotal = jest.fn();

jest.mock('./payout.repository', () => ({
	findPayout: mockFindPayout,
	findPayoutForStatusUpdate: mockFindPayoutForStatusUpdate,
	findPayoutForUpdate: mockFindPayoutForUpdate,
	findPayoutForDeletion: mockFindPayoutForDeletion,
	createPayout: mockCreatePayout,
	updatePayout: mockUpdatePayout,
	updatePayoutStatus: mockUpdatePayoutStatus,
	deletePayout: mockDeletePayout,
	findPaidOrConfirmedPayoutTotal: mockFindPaidOrConfirmedPayoutTotal,
}));

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));

jest.mock('@/modules/exchange-rates/exchange-rate.service', () => ({
	getLatestRates: mockGetLatestRates,
}));

jest.mock('@/modules/programs/program-reference.service', () => ({
	getProgramPayoutForecastSource: mockGetProgramPayoutForecastSource,
}));

jest.mock('@/modules/recipients/recipient.service', () => ({
	getRecipientProgramAssignment: mockGetRecipientProgramAssignment,
	recipientStatusService: {
		isRecipientEligibleForPayout: mockIsRecipientEligibleForPayout,
	},
}));

jest.mock('@/modules/local-partners/local-partner.service', () => ({
	getLocalPartnerIdBySlug: jest.fn(),
}));

jest.mock('@/lib/utils/now', () => ({
	now: () => new Date('2025-06-15T12:00:00.000Z'),
}));

import {
	createPayout,
	deletePayout,
	getPaidOrConfirmedPayoutTotal,
	getPayout,
	getPayoutForecastTableView,
	getPublicPayoutForecastTableView,
	updatePayout,
	updatePayoutStatus,
} from './payout.service';

const expectSuccess = <T>(result: ServiceResult<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: ServiceResult<unknown>, error: string): void => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}

	expect(result.error).toBe(error);
};

const baseProgram = {
	programDurationInMonths: 12,
	payoutPerInterval: 800,
	payoutInterval: PayoutInterval.monthly,
	country: { currency: Currency.SLE },
	recipients: [],
};

const operatorAccess = [
	{
		programId: 'program-1',
		programName: 'Program 1',
		permission: ProgramPermission.operator,
	},
];

const payoutInput = {
	recipientId: 'recipient-1',
	amount: 100,
	amountChf: 5,
	currency: Currency.SLE,
	status: PayoutStatus.paid,
	paymentAt: new Date('2025-06-01T00:00:00.000Z'),
	phoneNumber: null,
	comments: null,
};

describe('getPaidOrConfirmedPayoutTotal', () => {
	test('returns the CHF aggregate from the payout repository', async () => {
		mockFindPaidOrConfirmedPayoutTotal.mockResolvedValue({ _sum: { amountChf: 80 } });

		expect(await getPaidOrConfirmedPayoutTotal()).toEqual({ success: true, data: 80 });
	});
});

const payoutPayloadSource = {
	id: 'payout-1',
	amount: 100,
	amountChf: 5,
	currency: Currency.SLE,
	status: PayoutStatus.paid,
	paymentAt: payoutInput.paymentAt,
	phoneNumber: null,
	comments: null,
	recipient: {
		id: 'recipient-1',
		contact: { firstName: 'Ada', lastName: 'Lovelace' },
		program: { id: 'program-1', name: 'Program 1' },
	},
};

describe('payout forecasts', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetProgramPayoutForecastSource.mockResolvedValue({ success: true, data: baseProgram });
		mockGetLatestRates.mockResolvedValue({ success: true, data: { SLE: 24, USD: 1 } });
		mockIsRecipientEligibleForPayout.mockReturnValue({ success: true, data: true });
		mockGetAccessiblePrograms.mockResolvedValue({ success: true, data: operatorAccess });
	});

	test('returns program errors for the public forecast', async () => {
		mockGetProgramPayoutForecastSource.mockResolvedValue({
			success: false,
			error: 'Program not found',
		});

		expectFailure(
			await getPublicPayoutForecastTableView('missing-program', PAYOUT_FORECAST_MONTHS_AHEAD),
			'Program not found',
		);
	});

	test('returns exchange-rate service errors', async () => {
		mockGetLatestRates.mockResolvedValue({
			success: false,
			error: 'Could not fetch latest exchange rates',
		});

		expectFailure(
			await getPublicPayoutForecastTableView('program-1', PAYOUT_FORECAST_MONTHS_AHEAD),
			'Could not fetch latest exchange rates',
		);
	});

	test('returns missing exchange rate when the program currency rate is absent', async () => {
		mockGetLatestRates.mockResolvedValue({ success: true, data: { USD: 1 } });

		expectFailure(
			await getPublicPayoutForecastTableView('program-1', PAYOUT_FORECAST_MONTHS_AHEAD),
			'Missing exchange rate',
		);
	});

	test('counts eligible recipients and excludes ineligible recipients', async () => {
		mockGetProgramPayoutForecastSource.mockResolvedValue({
			success: true,
			data: {
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
		mockIsRecipientEligibleForPayout
			.mockReturnValueOnce({ success: true, data: true })
			.mockReturnValueOnce({ success: true, data: false });

		const data = expectSuccess(await getPublicPayoutForecastTableView('program-1', PAYOUT_FORECAST_MONTHS_AHEAD));

		expect(data.tableRows).toHaveLength(PAYOUT_FORECAST_MONTHS_AHEAD + 1);
		expect(data.tableRows[0]).toMatchObject({
			period: '2025-06',
			numberOfRecipients: 1,
			amountInProgramCurrency: 800,
			programCurrency: Currency.SLE,
		});
		expect(data.tableRows[0]?.amountUsd).toBeCloseTo(33.33, 1);
	});

	test('denies the private forecast without program access', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({ success: true, data: [] });

		expectFailure(
			await getPayoutForecastTableView('user-1', 'program-1', PAYOUT_FORECAST_MONTHS_AHEAD),
			'Access denied for this program',
		);
		expect(mockGetProgramPayoutForecastSource).not.toHaveBeenCalled();
	});
});

describe('payout writes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAccessiblePrograms.mockResolvedValue({ success: true, data: operatorAccess });
		mockGetRecipientProgramAssignment.mockResolvedValue({
			success: true,
			data: { id: 'recipient-1', programId: 'program-1', localPartnerId: 'partner-1' },
		});
		mockCreatePayout.mockResolvedValue(payoutPayloadSource);
	});

	test('creates a payout for a recipient in an operated program', async () => {
		const data = expectSuccess(await createPayout('user-1', payoutInput));

		expect(data).toMatchObject({
			id: 'payout-1',
			amount: 100,
			recipient: { id: 'recipient-1', programId: 'program-1' },
		});
		expect(mockCreatePayout).toHaveBeenCalledWith(payoutInput);
	});

	test('denies payout creation without operator access', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [
				{
					programId: 'program-1',
					programName: 'Program 1',
					permission: ProgramPermission.owner,
				},
			],
		});

		expectFailure(await createPayout('user-1', payoutInput), 'No edit access for this program');
		expect(mockCreatePayout).not.toHaveBeenCalled();
	});

	test('denies reading a payout without operator access', async () => {
		mockFindPayout.mockResolvedValue(payoutPayloadSource);
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [
				{
					programId: 'program-1',
					programName: 'Program 1',
					permission: ProgramPermission.owner,
				},
			],
		});

		expectFailure(await getPayout('user-1', 'payout-1'), 'Access denied to this payout');
	});

	test('denies updating a payout without operator access', async () => {
		mockFindPayoutForUpdate.mockResolvedValue({ recipient: { programId: 'program-1' } });
		mockGetAccessiblePrograms.mockResolvedValue({ success: true, data: [] });

		expectFailure(await updatePayout('user-1', { id: 'payout-1', ...payoutInput }), 'No edit permission for this payout');
		expect(mockUpdatePayout).not.toHaveBeenCalled();
	});

	test('updates a paid payout status for an operator', async () => {
		mockFindPayoutForStatusUpdate.mockResolvedValue({
			id: 'payout-1',
			status: PayoutStatus.paid,
			recipient: { programId: 'program-1' },
		});

		expect(expectSuccess(await updatePayoutStatus('user-1', 'payout-1', PayoutStatus.confirmed))).toBe(
			'Payout updated to "confirmed"',
		);
		expect(mockUpdatePayoutStatus).toHaveBeenCalledWith('payout-1', PayoutStatus.confirmed);
	});

	test('denies status updates without operator access', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({ success: true, data: [] });
		mockFindPayoutForStatusUpdate.mockResolvedValue({
			id: 'payout-1',
			status: PayoutStatus.paid,
			recipient: { programId: 'program-1' },
		});

		expectFailure(await updatePayoutStatus('user-1', 'payout-1', PayoutStatus.confirmed), 'Access denied for this payout');
	});

	test('only deletes failed payouts', async () => {
		mockFindPayoutForDeletion.mockResolvedValue({
			id: 'payout-1',
			status: PayoutStatus.paid,
			recipient: { programId: 'program-1' },
		});

		expectFailure(await deletePayout('user-1', 'payout-1'), 'Only payouts with status "failed" can be deleted');
		expect(mockDeletePayout).not.toHaveBeenCalled();
	});
});
