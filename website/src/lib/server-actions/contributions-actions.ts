'use server';

import { getStoryblokCampaignTitleForSlug } from '@/components/storyblok/campaign/campaign.utils';
import { getSessionByType } from '@/lib/firebase/current-account';
import { defaultLanguage } from '@/lib/i18n/utils';
import {
	ContributionFormCreateInput,
	ContributionFormUpdateInput,
} from '@/lib/services/contribution/contribution-form-input';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createContributionAction = async (contribution: ContributionFormCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.contribution.create(sessionResult.data.id, contribution);
	revalidatePath('/portal/management/contributions');

	return res;
};

export const updateContributionAction = async (contribution: ContributionFormUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.contribution.update(sessionResult.data.id, contribution);
	revalidatePath('/portal/management/contributions');

	return res;
};

export const getContributionAction = async (contributionId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return await services.read.contribution.get(sessionResult.data.id, contributionId);
};

export const getContributionsOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const [contributorOptions, campaignOptions, campaignStories] = await Promise.all([
		services.read.contributor.getEditableOptions(sessionResult.data.id),
		services.read.campaign.getEditableOptions(sessionResult.data.id),
		services.storyblok.getCampaigns(defaultLanguage),
	]);
	if (!contributorOptions.success) {
		return resultFail(contributorOptions.error);
	}
	if (!campaignOptions.success) {
		return resultFail(campaignOptions.error);
	}
	if (!campaignStories.success) {
		return resultFail(campaignStories.error);
	}
	const resolvedCampaignOptions = campaignOptions.data.map(({ id, name: slug }) => ({
		id,
		name: getStoryblokCampaignTitleForSlug(campaignStories.data, slug),
	}));

	return resultOk({ contributorOptions: contributorOptions.data, campaignOptions: resolvedCampaignOptions });
};
