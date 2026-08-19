'use server';

import { getCampaignPortalSlug, getStoryblokCampaignTitleForSlug } from '@/components/storyblok/campaign/campaign.utils';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { allWebsiteLanguages, defaultLanguage, type WebsiteLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';
import { isStoryblokManagementError } from '@/lib/services/storyblok/storyblok-management.service';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import { logger } from '@/lib/utils/logger';

const isWebsiteLanguage = (value: string): value is WebsiteLanguage =>
	allWebsiteLanguages.includes(value as WebsiteLanguage);

const DEFAULT_IMAGE_THUMB_WIDTH = 160;
const DEFAULT_IMAGE_THUMB_HEIGHT = 160;

export type CampaignDefaultImageOption = {
	id: number;
	url: string;
	alt: string | null;
};

export const getPublicCampaignTitleAction = async (campaignId: string) => {
	if (typeof campaignId !== 'string') {
		return resultFail('Invalid campaign id');
	}

	const normalizedCampaignId = campaignId.trim();
	if (!normalizedCampaignId) {
		return resultFail('Missing campaign id');
	}

	const campaignReference = await services.read.campaign.getPublicReferenceById(normalizedCampaignId);
	if (!campaignReference.success) {
		return campaignReference;
	}
	const campaignStories = await services.storyblok.getCampaigns(defaultLanguage);
	if (!campaignStories.success) {
		return resultFail(campaignStories.error);
	}
	const hasCampaignStory = campaignStories.data.some(
		(candidate) => getCampaignPortalSlug(candidate.content) === campaignReference.data.campaignPortalSlug,
	);

	return hasCampaignStory
		? resultOk({
				title: getStoryblokCampaignTitleForSlug(campaignStories.data, campaignReference.data.campaignPortalSlug),
			})
		: resultFail('Campaign not found');
};

export const getEligiblePublicSubmissionProgramsAction = async (lang: WebsiteLanguage = defaultLanguage) => {
	const language = isWebsiteLanguage(lang) ? lang : defaultLanguage;

	return services.programPublicSubmission.getEligibleProgramsForPublicSubmission(language);
};

export const getCampaignDefaultImagesAction = async () => {
	try {
		const assets = await services.storyblokManagement.listCampaignDefaultImages(
			campaignSubmissionConfig.maxCampaignDefaultImages,
		);

		const images: CampaignDefaultImageOption[] = assets.map((asset) => ({
			id: asset.id,
			url: formatStoryblokUrl(asset.filename, DEFAULT_IMAGE_THUMB_WIDTH, DEFAULT_IMAGE_THUMB_HEIGHT, asset.focus),
			alt: asset.alt,
		}));

		return resultOk(images);
	} catch (error) {
		if (isStoryblokManagementError(error)) {
			logger.error(error, { statusCode: error.statusCode, retryable: error.retryable });

			return resultFail('Could not load campaign default images.', error.retryable ? 503 : 502);
		}

		logger.error(error);

		return resultFail('Could not load campaign default images.');
	}
};
