'use server';

import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

export const getCampaignPageContentAction = async (lang: WebsiteLanguage) => {
	return services.read.campaignPublicWebsite.getPageContent(lang);
};

export const getCampaignPageMetadataAction = async (slug: string, lang: WebsiteLanguage) => {
	const result = await services.read.campaign.getBySlug(slug);
	if (!result.success || !result.data?.isActive) {
		return services.read.campaignPublicWebsite.getFallbackMetadata(lang);
	}

	return services.read.campaignPublicWebsite.getPageMetadata(lang, result.data);
};
