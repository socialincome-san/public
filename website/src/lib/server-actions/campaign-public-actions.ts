'use server';

import { allWebsiteLanguages, defaultLanguage, type WebsiteLanguage } from '@/lib/i18n/utils';
import { resultFail } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';

const isWebsiteLanguage = (value: string): value is WebsiteLanguage =>
	allWebsiteLanguages.includes(value as WebsiteLanguage);

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

export const getEligiblePublicSubmissionProgramsAction = async (lang: WebsiteLanguage = defaultLanguage) => {
	const language = isWebsiteLanguage(lang) ? lang : defaultLanguage;

	return services.programPublicSubmission.getEligibleProgramsForPublicSubmission(language);
};
