'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { CampaignReadService } from '@/lib/services/campaign/campaign-read.service';
import { CampaignWriteService } from '@/lib/services/campaign/campaign-write.service';
import { CampaignsCreateInput, CampaignsUpdateInput } from '@/lib/services/campaign/campaign.types';
import { ProgramReadService } from '@/lib/services/program/program-read.service';
import { revalidatePath } from 'next/cache';

export const createCampaignsAction = async (campaigns: CampaignsCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const campaignService = new CampaignWriteService();

	const res = await campaignService.create(user.id, campaigns);
	revalidatePath('/portal/management/campaigns');
	return res;
};

export const updateCampaignsAction = async (campaigns: CampaignsUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const campaignService = new CampaignWriteService();

	const res = await campaignService.update(user.id, campaigns);
	revalidatePath('/portal/management/campaigns');
	return res;
};

export const getCampaignsAction = async (campaignsId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	const campaignService = new CampaignReadService();

	return await campaignService.get(user.id, campaignsId);
};

export const getProgramsOptions = async () => {
	const user = await getAuthenticatedUserOrThrow();

	const programService = new ProgramReadService();
	const programs = await programService.getOptions(user.id);

	return programs;
};

export const getCampaignByIdAction = async (id: string) => {
	const campaignService = new CampaignReadService();

	return await campaignService.getById(id);
};
