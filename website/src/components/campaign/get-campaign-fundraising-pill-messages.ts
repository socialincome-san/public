import type { Currency } from '@/generated/prisma/client';

const DAYS_LEFT_THRESHOLD = 20;
const MISSING_GOAL_FRACTION_THRESHOLD = 0.2;

export type FundraisingPillMessage =
	| { type: 'days-left'; remainingDays: number }
	| { type: 'amount-missing'; missing: number; goal: number; currency: Currency }
	| { type: 'supporters-left'; supportersLeft: number; supporterGoal: number };

type CampaignFundraisingPillInput = {
	goal?: number | null;
	currency: Currency;
	amountCollected: number | null;
	numberOfContributions: number;
};

export const getSupporterGoal = (numberOfContributions: number): number => {
	if (numberOfContributions === 0) {
		return 10;
	}

	if (numberOfContributions % 10 === 0) {
		return numberOfContributions + 10;
	}

	return Math.ceil(numberOfContributions / 10) * 10;
};

export const getCampaignFundraisingPillMessages = (
	campaign: CampaignFundraisingPillInput,
	remainingDays: number,
): FundraisingPillMessage[] => {
	const messages: FundraisingPillMessage[] = [];

	if (remainingDays < DAYS_LEFT_THRESHOLD) {
		messages.push({ type: 'days-left', remainingDays });
	}

	const goal = campaign.goal;
	const amountCollected = campaign.amountCollected ?? 0;

	if (goal !== null && goal !== undefined && amountCollected < goal) {
		const missingFraction = (goal - amountCollected) / goal;

		if (missingFraction < MISSING_GOAL_FRACTION_THRESHOLD) {
			messages.push({
				type: 'amount-missing',
				missing: goal - amountCollected,
				goal,
				currency: campaign.currency,
			});
		}
	}

	const supporterGoal = getSupporterGoal(campaign.numberOfContributions);

	messages.push({
		type: 'supporters-left',
		supportersLeft: supporterGoal - campaign.numberOfContributions,
		supporterGoal,
	});

	return messages;
};
