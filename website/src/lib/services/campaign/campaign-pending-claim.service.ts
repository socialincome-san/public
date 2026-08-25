import { PrismaClient } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export type ClaimPendingCampaignsResult = {
	successfulClaimIds: string[];
};

const normalizeClaimIds = (claimIds: readonly string[]): string[] => {
	const seen = new Set<string>();
	const normalized: string[] = [];

	for (const claimId of claimIds) {
		const trimmed = claimId.trim();
		if (!trimmed || seen.has(trimmed)) {
			continue;
		}
		seen.add(trimmed);
		normalized.push(trimmed);
	}

	return normalized;
};

export class CampaignPendingClaimService extends BaseService {
	constructor(db: PrismaClient) {
		super(db);
	}

	async claimPendingCampaigns(
		contributorId: string,
		claimIds: readonly string[],
	): Promise<ServiceResult<ClaimPendingCampaignsResult>> {
		const successfulClaimIds: string[] = [];

		for (const claimId of normalizeClaimIds(claimIds)) {
			try {
				const claimed = await this.claimSinglePendingCampaign(contributorId, claimId);
				if (claimed) {
					successfulClaimIds.push(claimId);
				}
			} catch (error) {
				console.error(error, { claimId, contributorId, reason: 'claim-pending-failed' });
			}
		}

		return this.resultOk({ successfulClaimIds });
	}

	private async claimSinglePendingCampaign(contributorId: string, claimId: string): Promise<boolean> {
		const pending = await this.db.campaignPending.findUnique({
			where: { claimId },
			select: {
				claimId: true,
				campaignId: true,
				campaign: {
					select: {
						id: true,
						contributorId: true,
					},
				},
			},
		});

		if (!pending) {
			return true;
		}

		if (pending.campaign.contributorId === null) {
			await this.db.$transaction([
				this.db.campaign.update({
					where: { id: pending.campaignId },
					data: { contributor: { connect: { id: contributorId } } },
				}),
				this.db.campaignPending.delete({ where: { claimId } }),
			]);

			return true;
		}

		await this.db.campaignPending.delete({ where: { claimId } });

		return true;
	}
}
