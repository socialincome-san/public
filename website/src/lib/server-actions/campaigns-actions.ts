'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { CampaignFormCreateInput, CampaignFormUpdateInput } from '@/lib/services/campaign/campaign-form-input';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

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

export const createCampaignsAction = async (campaigns: CampaignFormCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.campaign.create(sessionResult.data.id, campaigns);
	revalidatePath('/portal/management/campaigns');

	return res;
};

export const updateCampaignsAction = async (campaigns: CampaignFormUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.campaign.update(sessionResult.data.id, campaigns);
	revalidatePath('/portal/management/campaigns');

	return res;
};

export const getCampaignsAction = async (campaignsId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return await services.read.campaign.get(sessionResult.data.id, campaignsId);
};

export const getProgramsOptions = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.read.program.getEditableOptions(sessionResult.data.id);
};

export const getCampaignByIdAction = async (id: string) => {
	return await services.read.campaign.getById(id);
};

export const getCampaignBySlugAction = async (slug: string) => {
	return await services.read.campaign.getBySlug(slug);
};
