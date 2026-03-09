'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ContributionCreateInput, ContributionUpdateInput } from '@/lib/services/contribution/contribution.types';
import { getServices } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createContributionAction = async (contribution: ContributionCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const res = await getServices().contributionWrite.create(user.id, contribution);
	revalidatePath('/portal/management/contributions');
	return res;
};

export const updateContributionAction = async (contribution: ContributionUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const res = await getServices().contributionWrite.update(user.id, contribution);
	revalidatePath('/portal/management/contributions');
	return res;
};

export const getContributionAction = async (contributionId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	return await getServices().contributionRead.get(user.id, contributionId);
};

export const getContributionsOptionsAction = async () => {
	const user = await getAuthenticatedUserOrThrow();
	const contributorOptions = await getServices().contributorRead.getOptions(user.id);
	const campaignOptions = await getServices().campaignRead.getOptions(user.id);
	return { contributorOptions, campaignOptions };
};
