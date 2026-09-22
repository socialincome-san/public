import type { ServiceResult } from '@/lib/service-result';
import type { PublicRecipientTableView } from './recipient.types';

const mockGetPublicRecipientsTableView = jest.fn<Promise<ServiceResult<PublicRecipientTableView>>, [string]>();

jest.mock('@/lib/firebase/current-account', () => ({
	getSessionByType: jest.fn(),
}));

jest.mock('next/cache', () => ({
	revalidatePath: jest.fn(),
}));

jest.mock('./recipient.service', () => ({
	getPublicRecipientsTableView: mockGetPublicRecipientsTableView,
}));

import { getPublicRecipientsTableAction } from './recipient.actions';

const expectFailure = (result: ServiceResult<unknown>, error: string) => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}
	expect(result.error).toBe(error);
};

describe('getPublicRecipientsTableAction', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns invalid program id for non-string input', async () => {
		const result = await getPublicRecipientsTableAction(null);

		expectFailure(result, 'Invalid program id');
		expect(mockGetPublicRecipientsTableView).not.toHaveBeenCalled();
	});

	test('delegates to the recipient service with a trimmed program id', async () => {
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
