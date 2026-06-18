import type { ServiceResult } from '@/lib/services/core/base.types';
import type { PayoutForecastTableView } from '@/lib/services/payout/payout.types';
import type { PublicRecipientTableView } from '@/lib/services/recipient/recipient-table.types';

const mockGetPublicForecastTableView = jest.fn<Promise<ServiceResult<PayoutForecastTableView>>, [string, number]>();
const mockGetPublicRecipientsTableView = jest.fn<Promise<ServiceResult<PublicRecipientTableView>>, [string]>();

jest.mock('@/lib/services/services', () => ({
	services: {
		read: {
			payout: {
				getPublicForecastTableView: mockGetPublicForecastTableView,
			},
			recipient: {
				getPublicRecipientsTableView: mockGetPublicRecipientsTableView,
			},
		},
	},
}));

import {
	getPublicPayoutForecastTableAction,
	getPublicRecipientsTableAction,
} from '@/lib/server-actions/program-detail-public-actions';
import { PAYOUT_FORECAST_MONTHS_AHEAD } from '@/lib/services/payout/payout-forecast.constants';

const expectFailure = (result: ServiceResult<unknown>, error: string) => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}
	expect(result.error).toBe(error);
};

describe('program detail public actions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getPublicPayoutForecastTableAction', () => {
		test('returns invalid program id for empty input', async () => {
			const result = await getPublicPayoutForecastTableAction('   ');

			expectFailure(result, 'Invalid program id');
			expect(mockGetPublicForecastTableView).not.toHaveBeenCalled();
		});

		test('delegates to payout read service with trimmed program id', async () => {
			const forecastResult: ServiceResult<PayoutForecastTableView> = {
				success: true,
				data: { tableRows: [] },
			};
			mockGetPublicForecastTableView.mockResolvedValue(forecastResult);

			const result = await getPublicPayoutForecastTableAction('  program-1  ');

			expect(mockGetPublicForecastTableView).toHaveBeenCalledWith('program-1', PAYOUT_FORECAST_MONTHS_AHEAD);
			expect(result).toEqual(forecastResult);
		});
	});

	describe('getPublicRecipientsTableAction', () => {
		test('returns invalid program id for non-string input', async () => {
			const result = await getPublicRecipientsTableAction(null as unknown as string);

			expectFailure(result, 'Invalid program id');
			expect(mockGetPublicRecipientsTableView).not.toHaveBeenCalled();
		});

		test('delegates to recipient read service with trimmed program id', async () => {
			const recipientsResult: ServiceResult<PublicRecipientTableView> = {
				success: true,
				data: { tableRows: [], totalCount: 0 },
			};
			mockGetPublicRecipientsTableView.mockResolvedValue(recipientsResult);

			const result = await getPublicRecipientsTableAction(' program-2 ');

			expect(mockGetPublicRecipientsTableView).toHaveBeenCalledWith('program-2');
			expect(result).toEqual(recipientsResult);
		});
	});
});
