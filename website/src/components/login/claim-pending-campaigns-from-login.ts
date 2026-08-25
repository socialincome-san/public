import { removePendingClaimIds } from '@/components/campaign/campaign-submission/pending-claim-ids';

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

export const claimPendingCampaignsFromLogin = async (claimIds: readonly string[]): Promise<void> => {
	if (claimIds.length === 0) {
		return;
	}

	try {
		const response = await fetch('/api/campaign-submissions/claim-pending', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ claimIds }),
		});

		if (!response.ok) {
			return;
		}

		const payload: unknown = await response.json().catch(() => null);
		removePendingClaimIds(readSuccessfulClaimIds(payload));
	} catch {
		// Fail soft: login should still succeed.
	}
};
