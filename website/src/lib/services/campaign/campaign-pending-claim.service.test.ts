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

	test('treats a missing pending row as success', async () => {
		const { service, findUnique, transaction, deletePending } = createService();
		findUnique.mockResolvedValue(null);

		const result = await service.claimPendingCampaigns('contributor-1', ['missing-claim']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.successfulClaimIds).toEqual(['missing-claim']);
		}
		expect(transaction).not.toHaveBeenCalled();
		expect(deletePending).not.toHaveBeenCalled();
	});

	test('sets contributorId and deletes pending when the campaign has no owner', async () => {
		const { service, findUnique, update, deletePending, transaction } = createService();
		findUnique.mockResolvedValue({
			claimId: 'Ab12Cd34',
			campaignId: 'campaign-1',
			campaign: { id: 'campaign-1', contributorId: null },
		});
		update.mockResolvedValue(undefined);
		deletePending.mockResolvedValue(undefined);

		const result = await service.claimPendingCampaigns('contributor-1', ['Ab12Cd34']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.successfulClaimIds).toEqual(['Ab12Cd34']);
		}
		expect(transaction).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledWith({
			where: { id: 'campaign-1' },
			data: { contributor: { connect: { id: 'contributor-1' } } },
		});
		expect(deletePending).toHaveBeenCalledWith({ where: { claimId: 'Ab12Cd34' } });
	});

	test('does not overwrite an existing contributorId and still deletes pending as success', async () => {
		const { service, findUnique, update, deletePending, transaction } = createService();
		findUnique.mockResolvedValue({
			claimId: 'Ab12Cd34',
			campaignId: 'campaign-1',
			campaign: { id: 'campaign-1', contributorId: 'other-contributor' },
		});
		deletePending.mockResolvedValue(undefined);

		const result = await service.claimPendingCampaigns('contributor-1', ['Ab12Cd34']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.successfulClaimIds).toEqual(['Ab12Cd34']);
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
				campaign: { id: 'campaign-1', contributorId: null },
			})
			.mockResolvedValueOnce(null);
		transaction.mockRejectedValue(new Error('db-down'));

		const result = await service.claimPendingCampaigns('contributor-1', ['Ab12Cd34', 'other']);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.successfulClaimIds).toEqual(['other']);
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
});
