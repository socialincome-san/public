'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { CampaignsCreateInput, CampaignsUpdateInput } from '@/lib/services/campaign/campaign.types';
import { getServices } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createCampaignsAction = async (campaigns: CampaignsCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const res = await getServices().campaignWrite.create(user.id, campaigns);
	revalidatePath('/portal/management/campaigns');
	return res;
};

export const updateCampaignsAction = async (campaigns: CampaignsUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const res = await getServices().campaignWrite.update(user.id, campaigns);
	revalidatePath('/portal/management/campaigns');
	return res;
};

export const getCampaignsAction = async (campaignsId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	return await getServices().campaignRead.get(user.id, campaignsId);
};

export const getProgramsOptions = async () => {
	const user = await getAuthenticatedUserOrThrow();
	return getServices().programRead.getOptions(user.id);
};

export const getCampaignByIdAction = async (id: string) => {
	return await getServices().campaignRead.getById(id);
};
