import { nowMs } from '@/lib/utils/now';

type CampaignPublicActivityInput = {
	endDate: Date;
	goal?: unknown;
	amountCollected?: number | null;
	now?: number;
};

/**
 * Public active/inactive state for campaign cards and filters.
 * Storyblok publish state is the visibility gate; this only reflects period/goal progress.
 */
export const isCampaignActive = ({
	endDate,
	goal,
	amountCollected,
	now = nowMs(),
}: CampaignPublicActivityInput): boolean => {
	if (endDate.getTime() <= now) {
		return false;
	}

	if (goal === null || goal === undefined || amountCollected === null || amountCollected === undefined) {
		return true;
	}

	const goalAmount = Number(goal);
	if (!Number.isFinite(goalAmount) || goalAmount <= 0) {
		return true;
	}

	return amountCollected < goalAmount;
};

export const matchesPublicCampaignActivity = (isActive: boolean, activity: 'active' | 'inactive' | 'all'): boolean => {
	if (activity === 'all') {
		return true;
	}

	return activity === 'active' ? isActive : !isActive;
};
