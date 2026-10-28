type CampaignActivityInput = {
	endDate: Date;
	goal?: unknown;
	amountCollected?: number | null;
	now?: number;
};

export const isCampaignActive = ({ endDate, goal, amountCollected, now = Date.now() }: CampaignActivityInput): boolean => {
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
