'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { CampaignService } from '@/lib/services/campaign/campaign.service';
import { ContributionService } from '@/lib/services/contribution/contribution.service';
import { ContributionUpdateInput } from '@/lib/services/contribution/contribution.types';
import { ContributorService } from '@/lib/services/contributor/contributor.service';
import { revalidatePath } from 'next/cache';

export async function updateContributionAction(contribution: ContributionUpdateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const contributionService = new ContributionService();

	const res = await contributionService.update(user.id, contribution);
	revalidatePath('/portal/management/contributions');
	return res;
}

export async function getContributionAction(contributionId: string) {
	const user = await getAuthenticatedUserOrThrow();
	const contributionService = new ContributionService();

	return await contributionService.get(user.id, contributionId);
}

export async function getContributionsOptionsAction() {
	const user = await getAuthenticatedUserOrThrow();
	const contributorService = new ContributorService();
	const campaignService = new CampaignService();
	const contributorOptions = await contributorService.getOptions(user.id);
	const campaignOptions = await campaignService.getOptions(user.id);

	return { contributorOptions, campaignOptions };
}
