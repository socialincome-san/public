'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { ContributionCreateInput, ContributionUpdateInput } from '@/lib/services/contribution/contribution.types';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createContributionAction = async (contribution: ContributionCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.contribution.create(sessionResult.data.id, contribution);
	revalidatePath('/portal/management/contributions');
	return res;
};

export const updateContributionAction = async (contribution: ContributionUpdateInput) => {
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
	const contributorOptions = await services.read.contributor.getOptions(sessionResult.data.id);
	if (!contributorOptions.success) {
		return resultFail(contributorOptions.error);
	}
	const campaignOptions = await services.read.campaign.getOptions(sessionResult.data.id);
	if (!campaignOptions.success) {
		return resultFail(campaignOptions.error);
	}
	return resultOk({ contributorOptions: contributorOptions.data, campaignOptions: campaignOptions.data });
};
