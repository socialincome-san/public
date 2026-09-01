import { removePendingClaimIds } from '@/components/campaign/campaign-submission/pending-claim-ids';
import { claimPendingCampaignsAction } from '@/lib/server-actions/campaign-submission-actions';

export type ClaimPendingCampaignsFromLoginResult = {
	campaignSlug: string | null;
};

export const claimPendingCampaignsFromLogin = async (
	claimIds: readonly string[],
): Promise<ClaimPendingCampaignsFromLoginResult> => {
	if (claimIds.length === 0) {
		return { campaignSlug: null };
	}

	try {
		const result = await claimPendingCampaignsAction(claimIds);
		if (!result.success) {
			return { campaignSlug: null };
		}

		removePendingClaimIds(result.data.successfulClaimIds);

		const campaignSlug = result.data.campaignSlug?.trim();

		return { campaignSlug: campaignSlug && campaignSlug.length > 0 ? campaignSlug : null };
	} catch {
		// Fail soft: login should still succeed.
		return { campaignSlug: null };
	}
};
