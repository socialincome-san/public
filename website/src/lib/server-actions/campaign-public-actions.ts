'use server';

import { getProgramPortalSlug } from '@/components/storyblok/program/program.utils';
import { defaultLanguage } from '@/lib/i18n/utils';
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

export const getEligiblePublicSubmissionProgramsAction = async () => {
	const programsResult = await services.storyblok.getPrograms(defaultLanguage);
	const publishedPortalSlugs = programsResult.success
		? [...new Set(programsResult.data.map((program) => getProgramPortalSlug(program.content)).filter(Boolean))]
		: [];

	return services.programPublicSubmission.getEligibleProgramOptions(publishedPortalSlugs);
};
