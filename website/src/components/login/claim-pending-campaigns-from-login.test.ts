jest.mock('@/components/campaign/campaign-submission/pending-claim-ids', () => ({
	removePendingClaimIds: jest.fn(),
}));

jest.mock('@/lib/server-actions/campaign-submission-actions', () => ({
	claimPendingCampaignsAction: jest.fn(),
}));

import { removePendingClaimIds } from '@/components/campaign/campaign-submission/pending-claim-ids';
import { claimPendingCampaignsAction } from '@/lib/server-actions/campaign-submission-actions';
import { claimPendingCampaignsFromLogin } from './claim-pending-campaigns-from-login';

const mockRemovePendingClaimIds = jest.mocked(removePendingClaimIds);
const mockClaimPendingCampaignsAction = jest.mocked(claimPendingCampaignsAction);

describe('claimPendingCampaignsFromLogin', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns null campaignSlug and skips the action when claim ids are empty', async () => {
		const result = await claimPendingCampaignsFromLogin([]);

		expect(result).toEqual({ campaignSlug: null });
		expect(mockClaimPendingCampaignsAction).not.toHaveBeenCalled();
		expect(mockRemovePendingClaimIds).not.toHaveBeenCalled();
	});

	test('clears successful claim ids and returns campaignSlug', async () => {
		mockClaimPendingCampaignsAction.mockResolvedValue({
			success: true,
			data: { successfulClaimIds: ['Ab12Cd34'], campaignSlug: 'my-campaign' },
		});

		const result = await claimPendingCampaignsFromLogin(['Ab12Cd34']);

		expect(result).toEqual({ campaignSlug: 'my-campaign' });
		expect(mockClaimPendingCampaignsAction).toHaveBeenCalledWith(['Ab12Cd34']);
		expect(mockRemovePendingClaimIds).toHaveBeenCalledWith(['Ab12Cd34']);
	});

	test('returns null campaignSlug when the action fails', async () => {
		mockClaimPendingCampaignsAction.mockResolvedValue({ success: false, error: 'submission-failed' });

		const result = await claimPendingCampaignsFromLogin(['Ab12Cd34']);

		expect(result).toEqual({ campaignSlug: null });
		expect(mockRemovePendingClaimIds).not.toHaveBeenCalled();
	});
});
