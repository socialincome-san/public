import { PrismaClient } from '@/generated/prisma/client';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export type ClaimPendingCampaignsResult = {
	successfulClaimIds: string[];
	campaignSlug?: string;
};

type ClaimSingleResult = { kind: 'missing' } | { kind: 'already-owned' } | { kind: 'owned'; campaignSlug: string | null };

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
		let campaignSlug: string | undefined;

		for (const claimId of normalizeClaimIds(claimIds)) {
			try {
				const claimed = await this.claimSinglePendingCampaign(contributorId, claimId);
				successfulClaimIds.push(claimId);

				if (claimed.kind === 'owned') {
					const slug = claimed.campaignSlug?.trim();
					if (slug) {
						campaignSlug = slug;
					}
				}
			} catch (error) {
				console.error(error, { claimId, contributorId, reason: 'claim-pending-failed' });
			}
		}

		return this.resultOk(campaignSlug ? { successfulClaimIds, campaignSlug } : { successfulClaimIds });
	}

	private async claimSinglePendingCampaign(contributorId: string, claimId: string): Promise<ClaimSingleResult> {
		const pending = await this.db.campaignPending.findUnique({
			where: { claimId },
			select: {
				claimId: true,
				campaignId: true,
				campaign: {
					select: {
						id: true,
						contributorId: true,
						slug: true,
					},
				},
			},
		});

		if (!pending) {
			return { kind: 'missing' };
		}

		if (pending.campaign.contributorId === null) {
			await this.db.$transaction([
				this.db.campaign.update({
					where: { id: pending.campaignId },
					data: { contributor: { connect: { id: contributorId } } },
				}),
				this.db.campaignPending.delete({ where: { claimId } }),
			]);

			return { kind: 'owned', campaignSlug: pending.campaign.slug };
		}

		await this.db.campaignPending.delete({ where: { claimId } });

		if (pending.campaign.contributorId === contributorId) {
			return { kind: 'owned', campaignSlug: pending.campaign.slug };
		}

		return { kind: 'already-owned' };
	}
}
