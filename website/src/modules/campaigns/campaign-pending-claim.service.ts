import { resultOk, type ServiceResult } from '@/lib/service-result';
import * as campaignRepository from './campaign.repository';
import type { ClaimPendingCampaignsResult } from './campaign.types';

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

export const claimPendingCampaigns = async (
	contributorId: string,
	claimIds: readonly string[],
): Promise<ServiceResult<ClaimPendingCampaignsResult>> => {
	const successfulClaimIds: string[] = [];
	let campaignSlug: string | undefined;

	for (const claimId of normalizeClaimIds(claimIds)) {
		try {
			const claimed = await claimSinglePendingCampaign(contributorId, claimId);
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

	return resultOk(campaignSlug ? { successfulClaimIds, campaignSlug } : { successfulClaimIds });
};

const claimSinglePendingCampaign = async (contributorId: string, claimId: string): Promise<ClaimSingleResult> => {
	const pending = await campaignRepository.findCampaignPendingByClaimId(claimId);
	if (!pending) {
		return { kind: 'missing' };
	}

	if (pending.campaign.contributorId === null) {
		await campaignRepository.updateCampaignContributorForClaim(pending.campaignId, claimId, contributorId);

		return { kind: 'owned', campaignSlug: pending.campaign.slug };
	}

	await campaignRepository.deleteCampaignPending(claimId);

	if (pending.campaign.contributorId === contributorId) {
		return { kind: 'owned', campaignSlug: pending.campaign.slug };
	}

	return { kind: 'already-owned' };
};
