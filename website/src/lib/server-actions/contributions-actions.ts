'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { CampaignReadService } from '@/lib/services/campaign/campaign-read.service';
import { ContributionReadService } from '@/lib/services/contribution/contribution-read.service';
import { ContributionWriteService } from '@/lib/services/contribution/contribution-write.service';
import { ContributionCreateInput, ContributionUpdateInput } from '@/lib/services/contribution/contribution.types';
import { ContributorReadService } from '@/lib/services/contributor/contributor-read.service';
import { revalidatePath } from 'next/cache';

export const createContributionAction = async (contribution: ContributionCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const contributionService = new ContributionWriteService();

	const res = await contributionService.create(user.id, contribution);

	revalidatePath('/portal/management/contributions');
	return res;
};

export const updateContributionAction = async (contribution: ContributionUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const contributionService = new ContributionWriteService();

	const res = await contributionService.update(user.id, contribution);
	revalidatePath('/portal/management/contributions');
	return res;
};

export const getContributionAction = async (contributionId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	const contributionService = new ContributionReadService();

	return await contributionService.get(user.id, contributionId);
};

export const getContributionsOptionsAction = async () => {
	const user = await getAuthenticatedUserOrThrow();
	const contributorService = new ContributorReadService();
	const campaignService = new CampaignReadService();
	const contributorOptions = await contributorService.getOptions(user.id);
	const campaignOptions = await campaignService.getOptions(user.id);

	return { contributorOptions, campaignOptions };
};
