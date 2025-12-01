'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { CampaignService } from '@/lib/services/campaign/campaign.service';
import { CampaignsCreateInput, CampaignsUpdateInput } from '@/lib/services/campaign/campaign.types';
import { ProgramService } from '@/lib/services/program/program.service';
import { revalidatePath } from 'next/cache';

export async function createCampaignsAction(campaigns: CampaignsCreateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const campaignService = new CampaignService();

	const res = await campaignService.create(user.id, campaigns);
	revalidatePath('/portal/management/campaigns');
	return res;
}

export async function updateCampaignsAction(campaigns: CampaignsUpdateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const campaignService = new CampaignService();

	const res = await campaignService.update(user.id, campaigns);
	revalidatePath('/portal/management/campaigns');
	return res;
}

export async function getCampaignsAction(campaignsId: string) {
	const user = await getAuthenticatedUserOrThrow();
	const campaignService = new CampaignService();

	return await campaignService.get(user.id, campaignsId);
}

export async function getProgramsOptions() {
	const user = await getAuthenticatedUserOrThrow();

	const programService = new ProgramService();
	const programs = await programService.getOptions(user.id);

	return programs;
}

export async function getCampaignByLegacyIdAction(campaignLegacyId: string) {
	const campaignService = new CampaignService();

	return await campaignService.getByLegacyId(campaignLegacyId);
}
