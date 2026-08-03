import { nowMs } from '@/lib/utils/now';

type CampaignPublicActivityInput = {
	endDate: Date;
	goal?: number | null | unknown;
	amountCollected?: number | null;
	now?: number;
};

/**
 * Public active/inactive state for campaign cards and filters.
 * Storyblok publish state is the visibility gate; this only reflects period/goal progress.
 */
export const isCampaignPubliclyActive = ({
	endDate,
	goal,
	amountCollected,
	now = nowMs(),
}: CampaignPublicActivityInput): boolean => {
	const dateNow = new Date(now);
	console.log('dateNow', dateNow);
	console.log('Difference in ms', (now - (endDate.getTime())));
	if (endDate.getTime() <= now) {
		console.log('endDate', endDate.getTime());
		console.log('now', now);
		return false;
	}

	if (goal == null || amountCollected == null) {
		return true;
	}

	const goalAmount = Number(goal);
	if (!Number.isFinite(goalAmount) || goalAmount <= 0) {
		return true;
	}

	return amountCollected < goalAmount;
};

export const matchesPublicCampaignActivity = (
	isActive: boolean,
	activity: 'active' | 'inactive' | 'all',
): boolean => {
	if (activity === 'all') {
		return true;
	}

	return activity === 'active' ? isActive : !isActive;
};
