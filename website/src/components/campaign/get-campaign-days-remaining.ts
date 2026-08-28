import { nowMs } from '@/lib/utils/now';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type CampaignDaysRemaining = {
	remainingDays: number;
	progress: number;
};

type GetCampaignDaysRemainingParams = {
	endDate: Date;
	createdAt: Date;
	now?: number;
};

export const getCampaignDaysRemaining = ({
	endDate,
	createdAt,
	now = nowMs(),
}: GetCampaignDaysRemainingParams): CampaignDaysRemaining => {
	const totalCampaignDurationMs = Math.max(1, endDate.getTime() - createdAt.getTime());
	const remainingCampaignDurationMs = Math.min(totalCampaignDurationMs, Math.max(0, endDate.getTime() - now));

	return {
		remainingDays: Math.max(0, Math.ceil(remainingCampaignDurationMs / MS_PER_DAY)),
		progress: 100 - Math.min(100, (remainingCampaignDurationMs / totalCampaignDurationMs) * 100),
	};
};
