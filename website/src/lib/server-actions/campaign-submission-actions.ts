'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import type { ClaimPendingCampaignsResult } from '@/lib/services/campaign/campaign-pending-claim.service';
import {
	createCampaignSubmissionPersonalSchema,
	isCampaignSubmissionErrorCode,
} from '@/lib/services/campaign/campaign-submission-input';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';

const personalSchema = createCampaignSubmissionPersonalSchema((code) => code);

const emptyClaimResult: ClaimPendingCampaignsResult = { successfulClaimIds: [] };

const readClaimIds = (claimIds: unknown): string[] => {
	if (!Array.isArray(claimIds)) {
		return [];
	}

	return claimIds.filter((claimId): claimId is string => typeof claimId === 'string');
};

export const ensureCampaignGuestAccountAction = async (input: unknown) => {
	const parsed = personalSchema.safeParse(input);
	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message;
		const errorCode = message && isCampaignSubmissionErrorCode(message) ? message : 'invalid-submission';

		return resultFail(errorCode, 400);
	}

	const result = await services.write.contributor.getOrCreateFromEmailAndName(parsed.data);
	if (!result.success) {
		console.error(result.error);

		return resultFail('submission-failed', 503);
	}

	return resultOk(true);
};

export const claimPendingCampaignsAction = async (claimIds: unknown) => {
	const contributorSession = await getSessionByType('contributor');
	if (!contributorSession.success) {
		return resultOk(emptyClaimResult);
	}

	const pendingClaimIds = readClaimIds(claimIds);
	if (pendingClaimIds.length === 0) {
		return resultOk(emptyClaimResult);
	}

	const result = await services.campaignPendingClaim.claimPendingCampaigns(contributorSession.data.id, pendingClaimIds);
	if (!result.success) {
		console.error(result.error);

		return resultFail('submission-failed', 503);
	}

	return resultOk(result.data);
};
