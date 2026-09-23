jest.mock('./campaign.repository', () => ({
	findCampaignPendingByClaimId: jest.fn(),
	updateCampaignContributorForClaim: jest.fn(),
	deleteCampaignPending: jest.fn(),
}));

import { claimPendingCampaigns } from './campaign-pending-claim.service';
import * as campaignRepository from './campaign.repository';

const mockFindCampaignPendingByClaimId = campaignRepository.findCampaignPendingByClaimId as jest.Mock;
const mockClaimUnownedPendingCampaign = campaignRepository.updateCampaignContributorForClaim as jest.Mock;
const mockDeleteCampaignPending = campaignRepository.deleteCampaignPending as jest.Mock;

describe('claimPendingCampaigns', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockClaimUnownedPendingCampaign.mockResolvedValue(undefined);
		mockDeleteCampaignPending.mockResolvedValue(undefined);
	});

	test('treats a missing pending row as success without campaignSlug', async () => {
		mockFindCampaignPendingByClaimId.mockResolvedValue(null);

		const result = await claimPendingCampaigns('contributor-1', ['missing-claim']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['missing-claim'] });
		}
		expect(mockClaimUnownedPendingCampaign).not.toHaveBeenCalled();
		expect(mockDeleteCampaignPending).not.toHaveBeenCalled();
	});

	test('sets contributorId, deletes pending, and returns campaignSlug when newly owned', async () => {
		mockFindCampaignPendingByClaimId.mockResolvedValue({
			claimId: 'Ab12Cd34',
			campaignId: 'campaign-1',
			campaign: { id: 'campaign-1', contributorId: null, slug: 'my-campaign' },
		});

		const result = await claimPendingCampaigns('contributor-1', ['Ab12Cd34']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['Ab12Cd34'], campaignSlug: 'my-campaign' });
		}
		expect(mockClaimUnownedPendingCampaign).toHaveBeenCalledWith('campaign-1', 'Ab12Cd34', 'contributor-1');
		expect(mockDeleteCampaignPending).not.toHaveBeenCalled();
	});

	test('returns the campaignSlug of the last newly-owned claim in array order', async () => {
		mockFindCampaignPendingByClaimId
			.mockResolvedValueOnce({
				claimId: 'claim-old',
				campaignId: 'campaign-1',
				campaign: { id: 'campaign-1', contributorId: null, slug: 'older-campaign' },
			})
			.mockResolvedValueOnce({
				claimId: 'claim-owned',
				campaignId: 'campaign-2',
				campaign: { id: 'campaign-2', contributorId: 'other', slug: 'already-owned' },
			})
			.mockResolvedValueOnce({
				claimId: 'claim-new',
				campaignId: 'campaign-3',
				campaign: { id: 'campaign-3', contributorId: null, slug: 'newest-campaign' },
			});

		const result = await claimPendingCampaigns('contributor-1', ['claim-old', 'claim-owned', 'claim-new']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.successfulClaimIds).toEqual(['claim-old', 'claim-owned', 'claim-new']);
			expect(result.data.campaignSlug).toBe('newest-campaign');
		}
	});

	test('does not overwrite an existing contributorId and does not set campaignSlug', async () => {
		mockFindCampaignPendingByClaimId.mockResolvedValue({
			claimId: 'Ab12Cd34',
			campaignId: 'campaign-1',
			campaign: { id: 'campaign-1', contributorId: 'other-contributor', slug: 'owned-campaign' },
		});

		const result = await claimPendingCampaigns('contributor-1', ['Ab12Cd34']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['Ab12Cd34'] });
		}
		expect(mockClaimUnownedPendingCampaign).not.toHaveBeenCalled();
		expect(mockDeleteCampaignPending).toHaveBeenCalledWith('Ab12Cd34');
	});

	test('returns campaignSlug when the campaign is already owned by the claiming contributor', async () => {
		mockFindCampaignPendingByClaimId.mockResolvedValue({
			claimId: 'Ab12Cd34',
			campaignId: 'campaign-1',
			campaign: { id: 'campaign-1', contributorId: 'contributor-1', slug: 'my-campaign' },
		});

		const result = await claimPendingCampaigns('contributor-1', ['Ab12Cd34']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['Ab12Cd34'], campaignSlug: 'my-campaign' });
		}
		expect(mockClaimUnownedPendingCampaign).not.toHaveBeenCalled();
		expect(mockDeleteCampaignPending).toHaveBeenCalledWith('Ab12Cd34');
	});

	test('omits claim ids that fail during write', async () => {
		mockFindCampaignPendingByClaimId
			.mockResolvedValueOnce({
				claimId: 'Ab12Cd34',
				campaignId: 'campaign-1',
				campaign: { id: 'campaign-1', contributorId: null, slug: 'failed-campaign' },
			})
			.mockResolvedValueOnce(null);
		mockClaimUnownedPendingCampaign.mockRejectedValue(new Error('db-down'));

		const result = await claimPendingCampaigns('contributor-1', ['Ab12Cd34', 'other']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['other'] });
		}
	});

	test('dedupes and ignores empty claim ids', async () => {
		mockFindCampaignPendingByClaimId.mockResolvedValue(null);

		const result = await claimPendingCampaigns('contributor-1', ['Ab12Cd34', ' Ab12Cd34 ', '', 'Xy98Zk76']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.successfulClaimIds).toEqual(['Ab12Cd34', 'Xy98Zk76']);
		}
		expect(mockFindCampaignPendingByClaimId).toHaveBeenCalledTimes(2);
	});

	test('omits campaignSlug when the newly owned campaign has no slug', async () => {
		mockFindCampaignPendingByClaimId.mockResolvedValue({
			claimId: 'Ab12Cd34',
			campaignId: 'campaign-1',
			campaign: { id: 'campaign-1', contributorId: null, slug: null },
		});

		const result = await claimPendingCampaigns('contributor-1', ['Ab12Cd34']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['Ab12Cd34'] });
		}
	});
});
