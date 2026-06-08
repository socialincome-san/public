'use server';

import { resultFail } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';

export const getPublicCampaignTitleAction = async (campaignId: string) => {
	if (typeof campaignId !== 'string') {
		return resultFail('Invalid campaign id');
	}

	const normalizedCampaignId = campaignId.trim();
	if (!normalizedCampaignId) {
		return resultFail('Missing campaign id');
	}

	return services.read.campaign.getPublicTitleById(normalizedCampaignId);
};
