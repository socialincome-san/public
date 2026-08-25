import { removePendingClaimIds } from '@/components/campaign/campaign-submission/pending-claim-ids';

export type ClaimPendingCampaignsFromLoginResult = {
	campaignSlug: string | null;
};

const readSuccessfulClaimIds = (payload: unknown): string[] => {
	if (typeof payload !== 'object' || payload === null || !('successfulClaimIds' in payload)) {
		return [];
	}

	const { successfulClaimIds } = payload;
	if (!Array.isArray(successfulClaimIds)) {
		return [];
	}

	return successfulClaimIds.filter((claimId): claimId is string => typeof claimId === 'string' && claimId.trim().length > 0);
};

const readCampaignSlug = (payload: unknown): string | null => {
	if (typeof payload !== 'object' || payload === null || !('campaignSlug' in payload)) {
		return null;
	}

	const { campaignSlug } = payload;
	if (typeof campaignSlug !== 'string') {
		return null;
	}

	const trimmed = campaignSlug.trim();
	return trimmed.length > 0 ? trimmed : null;
};

export const claimPendingCampaignsFromLogin = async (
	claimIds: readonly string[],
): Promise<ClaimPendingCampaignsFromLoginResult> => {
	if (claimIds.length === 0) {
		return { campaignSlug: null };
	}

	try {
		const response = await fetch('/api/campaign-submissions/claim-pending', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ claimIds }),
		});

		if (!response.ok) {
			return { campaignSlug: null };
		}

		const payload: unknown = await response.json().catch(() => null);
		removePendingClaimIds(readSuccessfulClaimIds(payload));

		return { campaignSlug: readCampaignSlug(payload) };
	} catch {
		// Fail soft: login should still succeed.
		return { campaignSlug: null };
	}
};
