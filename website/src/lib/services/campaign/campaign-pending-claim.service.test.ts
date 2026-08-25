jest.mock('@/generated/prisma/client', () => ({
	PrismaClient: class {},
}));

import { CampaignPendingClaimService } from './campaign-pending-claim.service';

describe('CampaignPendingClaimService', () => {
	const createService = () => {
		const findUnique = jest.fn();
		const update = jest.fn();
		const deletePending = jest.fn();
		const transaction = jest.fn().mockResolvedValue(undefined);

		const db = {
			campaignPending: {
				findUnique,
				delete: deletePending,
			},
			campaign: {
				update,
			},
			$transaction: transaction,
		};

		const service = new CampaignPendingClaimService(db as never);

		return { service, findUnique, update, deletePending, transaction };
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('treats a missing pending row as success without campaignSlug', async () => {
		const { service, findUnique, transaction, deletePending } = createService();
		findUnique.mockResolvedValue(null);

		const result = await service.claimPendingCampaigns('contributor-1', ['missing-claim']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['missing-claim'] });
		}
		expect(transaction).not.toHaveBeenCalled();
		expect(deletePending).not.toHaveBeenCalled();
	});

	test('sets contributorId, deletes pending, and returns campaignSlug when newly owned', async () => {
		const { service, findUnique, update, deletePending, transaction } = createService();
		findUnique.mockResolvedValue({
			claimId: 'Ab12Cd34',
			campaignId: 'campaign-1',
			campaign: { id: 'campaign-1', contributorId: null, slug: 'my-campaign' },
		});
		update.mockResolvedValue(undefined);
		deletePending.mockResolvedValue(undefined);

		const result = await service.claimPendingCampaigns('contributor-1', ['Ab12Cd34']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['Ab12Cd34'], campaignSlug: 'my-campaign' });
		}
		expect(transaction).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledWith({
			where: { id: 'campaign-1' },
			data: { contributor: { connect: { id: 'contributor-1' } } },
		});
		expect(deletePending).toHaveBeenCalledWith({ where: { claimId: 'Ab12Cd34' } });
	});

	test('returns the campaignSlug of the last newly-owned claim in array order', async () => {
		const { service, findUnique } = createService();
		findUnique
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

		const result = await service.claimPendingCampaigns('contributor-1', ['claim-old', 'claim-owned', 'claim-new']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.successfulClaimIds).toEqual(['claim-old', 'claim-owned', 'claim-new']);
			expect(result.data.campaignSlug).toBe('newest-campaign');
		}
	});

	test('does not overwrite an existing contributorId and does not set campaignSlug', async () => {
		const { service, findUnique, update, deletePending, transaction } = createService();
		findUnique.mockResolvedValue({
			claimId: 'Ab12Cd34',
			campaignId: 'campaign-1',
			campaign: { id: 'campaign-1', contributorId: 'other-contributor', slug: 'owned-campaign' },
		});
		deletePending.mockResolvedValue(undefined);

		const result = await service.claimPendingCampaigns('contributor-1', ['Ab12Cd34']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['Ab12Cd34'] });
		}
		expect(transaction).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
		expect(deletePending).toHaveBeenCalledWith({ where: { claimId: 'Ab12Cd34' } });
	});

	test('omits claim ids that fail during write', async () => {
		const { service, findUnique, transaction } = createService();
		findUnique
			.mockResolvedValueOnce({
				claimId: 'Ab12Cd34',
				campaignId: 'campaign-1',
				campaign: { id: 'campaign-1', contributorId: null, slug: 'failed-campaign' },
			})
			.mockResolvedValueOnce(null);
		transaction.mockRejectedValue(new Error('db-down'));

		const result = await service.claimPendingCampaigns('contributor-1', ['Ab12Cd34', 'other']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['other'] });
		}
	});

	test('dedupes and ignores empty claim ids', async () => {
		const { service, findUnique } = createService();
		findUnique.mockResolvedValue(null);

		const result = await service.claimPendingCampaigns('contributor-1', ['Ab12Cd34', ' Ab12Cd34 ', '', 'Xy98Zk76']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.successfulClaimIds).toEqual(['Ab12Cd34', 'Xy98Zk76']);
		}
		expect(findUnique).toHaveBeenCalledTimes(2);
	});

	test('omits campaignSlug when the newly owned campaign has no slug', async () => {
		const { service, findUnique } = createService();
		findUnique.mockResolvedValue({
			claimId: 'Ab12Cd34',
			campaignId: 'campaign-1',
			campaign: { id: 'campaign-1', contributorId: null, slug: null },
		});

		const result = await service.claimPendingCampaigns('contributor-1', ['Ab12Cd34']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({ successfulClaimIds: ['Ab12Cd34'] });
		}
	});
});
