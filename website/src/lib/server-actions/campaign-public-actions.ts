'use server';

import { services } from '@/lib/services/services';

export const getPublicCampaignTitleAction = async (campaignId: string) => {
	return services.read.campaign.getPublicTitleById(campaignId);
};
