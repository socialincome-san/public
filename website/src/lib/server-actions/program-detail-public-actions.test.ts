import type { ServiceResult } from '@/lib/services/core/base.types';
import type { PublicRecipientTableView } from '@/modules/recipients/recipient.types';

const mockGetPublicRecipientsTableView = jest.fn<Promise<ServiceResult<PublicRecipientTableView>>, [string]>();

jest.mock('@/modules/recipients/recipient.service', () => ({
	getPublicRecipientsTableView: mockGetPublicRecipientsTableView,
}));

import { getPublicRecipientsTableAction } from '@/lib/server-actions/program-detail-public-actions';

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
