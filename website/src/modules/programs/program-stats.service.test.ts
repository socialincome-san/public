import { Currency, PayoutInterval } from '@/generated/prisma/enums';
import { resultOk } from '@/lib/service-result';

const mockGetLatestRates = jest.fn();
const mockFindProgramDashboardSource = jest.fn();
const mockGetExpectedIntervals = jest.fn();
const mockCountPaidOrConfirmedPayouts = jest.fn();
const mockGetRecipientLifecycleStatus = jest.fn();

jest.mock('@/modules/exchange-rates/exchange-rate.service', () => ({
	getLatestRates: mockGetLatestRates,
}));
jest.mock('@/modules/recipients/recipient.service', () => ({
	recipientStatusService: {
		countPaidOrConfirmedPayouts: mockCountPaidOrConfirmedPayouts,
		getExpectedIntervals: mockGetExpectedIntervals,
		getRecipientLifecycleStatusFromExpectedIntervals: mockGetRecipientLifecycleStatus,
		isRecipientEligibleForPayout: jest.fn(),
	},
}));
jest.mock('./program.repository', () => ({
	findProgramDashboardSource: mockFindProgramDashboardSource,
}));

import { calculateProgramBudget, isReadyForFirstPayoutInterval } from './program-stats.service';

describe('program stats service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetLatestRates.mockResolvedValue(
			resultOk({
				[Currency.CHF]: 1,
				[Currency.SLE]: 20,
			}),
		);
	});

	it('calculates a monthly budget in the display currency', async () => {
		const result = await calculateProgramBudget({
			amountOfRecipients: 10,
			programDuration: 12,
			defaultPayoutPerInterval: 100,
			payoutPerInterval: 100,
			payoutInterval: PayoutInterval.monthly,
			payoutCurrency: Currency.SLE,
			displayCurrency: Currency.CHF,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.calculatedTotalBudget).toBe(600);
			expect(result.data.displayMonthlyCost).toBe(50);
			expect(result.data.payoutToDisplayRate).toBe(0.05);
		}
	});

	it('treats reserve-covered programs as ready', async () => {
		mockFindProgramDashboardSource.mockResolvedValue({
			coveredByReserves: true,
			programDurationInMonths: 12,
			payoutPerInterval: 100,
			payoutInterval: PayoutInterval.monthly,
			country: { currency: Currency.SLE },
			recipients: [],
			campaigns: [],
		});
		mockGetExpectedIntervals.mockReturnValue(resultOk(12));

		await expect(isReadyForFirstPayoutInterval('program-1')).resolves.toEqual(resultOk(true));
	});
});
