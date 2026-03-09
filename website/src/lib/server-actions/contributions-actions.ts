'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ContributionCreateInput, ContributionUpdateInput } from '@/lib/services/contribution/contribution.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createContributionAction = async (contribution: ContributionCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const res = await services.write.contribution.create(user.id, contribution);
	revalidatePath('/portal/management/contributions');
	return res;
};

export const updateContributionAction = async (contribution: ContributionUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const res = await services.write.contribution.update(user.id, contribution);
	revalidatePath('/portal/management/contributions');
	return res;
};

export const getContributionAction = async (contributionId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	return await services.read.contribution.get(user.id, contributionId);
};

export const getContributionsOptionsAction = async () => {
	const user = await getAuthenticatedUserOrThrow();
	const contributorOptions = await services.read.contributor.getOptions(user.id);
	const campaignOptions = await services.read.campaign.getOptions(user.id);
	return { contributorOptions, campaignOptions };
};
