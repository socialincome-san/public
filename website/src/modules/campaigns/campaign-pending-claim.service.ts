import type { AuditContext } from '@/lib/audit/audit-types';
import { resultOk, type Result } from '@/lib/result';
import * as campaignRepository from './campaign.repository.read';
import * as campaignWriteRepository from './campaign.repository.write';
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
	audit: AuditContext,
	contributorId: string,
	claimIds: readonly string[],
): Promise<Result<ClaimPendingCampaignsResult>> => {
	const successfulClaimIds: string[] = [];
	let campaignSlug: string | undefined;

	for (const claimId of normalizeClaimIds(claimIds)) {
		try {
			const claimed = await claimSinglePendingCampaign(audit, contributorId, claimId);
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

const claimSinglePendingCampaign = async (
	audit: AuditContext,
	contributorId: string,
	claimId: string,
): Promise<ClaimSingleResult> => {
	const pending = await campaignRepository.findCampaignPendingByClaimId(claimId);
	if (!pending) {
		return { kind: 'missing' };
	}

	if (pending.campaign.contributorId === null) {
		await campaignWriteRepository.updateCampaignContributorForClaim(audit, pending.campaignId, claimId, contributorId);

		return { kind: 'owned', campaignSlug: pending.campaign.slug };
	}

	await campaignWriteRepository.deleteCampaignPending(audit, pending.campaignId, claimId);

	if (pending.campaign.contributorId === contributorId) {
		return { kind: 'owned', campaignSlug: pending.campaign.slug };
	}

	return { kind: 'already-owned' };
};
