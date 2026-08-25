const mockRemovePendingClaimIds = jest.fn();

jest.mock('@/components/campaign/campaign-submission/pending-claim-ids', () => ({
	removePendingClaimIds: (...args: unknown[]) => mockRemovePendingClaimIds(...args),
}));

import { claimPendingCampaignsFromLogin } from './claim-pending-campaigns-from-login';

describe('claimPendingCampaignsFromLogin', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
	});

	test('returns null campaignSlug and skips fetch when claim ids are empty', async () => {
		const result = await claimPendingCampaignsFromLogin([]);

		expect(result).toEqual({ campaignSlug: null });
		expect(global.fetch).not.toHaveBeenCalled();
		expect(mockRemovePendingClaimIds).not.toHaveBeenCalled();
	});

	test('clears successful claim ids and returns campaignSlug', async () => {
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({ successfulClaimIds: ['Ab12Cd34'], campaignSlug: 'my-campaign' }),
		});

		const result = await claimPendingCampaignsFromLogin(['Ab12Cd34']);

		expect(result).toEqual({ campaignSlug: 'my-campaign' });
		expect(mockRemovePendingClaimIds).toHaveBeenCalledWith(['Ab12Cd34']);
	});

	test('returns null campaignSlug when the request fails', async () => {
		(global.fetch as jest.Mock).mockResolvedValue({ ok: false });

		const result = await claimPendingCampaignsFromLogin(['Ab12Cd34']);

		expect(result).toEqual({ campaignSlug: null });
		expect(mockRemovePendingClaimIds).not.toHaveBeenCalled();
	});
});
