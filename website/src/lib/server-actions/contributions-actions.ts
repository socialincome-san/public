'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { CampaignService } from '@/lib/services/campaign/campaign.service';
import { ContributionService } from '@/lib/services/contribution/contribution.service';
import { ContributionCreateInput, ContributionUpdateInput } from '@/lib/services/contribution/contribution.types';
import { ContributorService } from '@/lib/services/contributor/contributor.service';
import { revalidatePath } from 'next/cache';

export const createContributionAction = async (contribution: ContributionCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const contributionService = new ContributionService();

	const res = await contributionService.create(user.id, contribution);

	revalidatePath('/portal/management/contributions');
	return res;
}

export const updateContributionAction = async (contribution: ContributionUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const contributionService = new ContributionService();

	const res = await contributionService.update(user.id, contribution);
	revalidatePath('/portal/management/contributions');
	return res;
}

export const getContributionAction = async (contributionId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	const contributionService = new ContributionService();

	return await contributionService.get(user.id, contributionId);
}

export const getContributionsOptionsAction = async () => {
	const user = await getAuthenticatedUserOrThrow();
	const contributorService = new ContributorService();
	const campaignService = new CampaignService();
	const contributorOptions = await contributorService.getOptions(user.id);
	const campaignOptions = await campaignService.getOptions(user.id);

	return { contributorOptions, campaignOptions };
}
