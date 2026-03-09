'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { CampaignsCreateInput, CampaignsUpdateInput } from '@/lib/services/campaign/campaign.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createCampaignsAction = async (campaigns: CampaignsCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const res = await services.write.campaign.create(user.id, campaigns);
	revalidatePath('/portal/management/campaigns');
	return res;
};

export const updateCampaignsAction = async (campaigns: CampaignsUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const res = await services.write.campaign.update(user.id, campaigns);
	revalidatePath('/portal/management/campaigns');
	return res;
};

export const getCampaignsAction = async (campaignsId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	return await services.read.campaign.get(user.id, campaignsId);
};

export const getProgramsOptions = async () => {
	const user = await getAuthenticatedUserOrThrow();
	return services.read.program.getOptions(user.id);
};

export const getCampaignByIdAction = async (id: string) => {
	return await services.read.campaign.getById(id);
};
