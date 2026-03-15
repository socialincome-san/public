'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { CampaignsCreateInput, CampaignsUpdateInput } from '@/lib/services/campaign/campaign.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createCampaignsAction = async (campaigns: CampaignsCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.campaign.create(sessionResult.data.id, campaigns);
	revalidatePath('/portal/management/campaigns');
	return res;
};

export const updateCampaignsAction = async (campaigns: CampaignsUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.campaign.update(sessionResult.data.id, campaigns);
	revalidatePath('/portal/management/campaigns');
	return res;
};

export const getCampaignsAction = async (campaignsId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return await services.read.campaign.get(sessionResult.data.id, campaignsId);
};

export const getProgramsOptions = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.program.getOptions(sessionResult.data.id);
};

export const getCampaignByIdAction = async (id: string) => {
	return await services.read.campaign.getById(id);
};
