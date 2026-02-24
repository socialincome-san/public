'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ContributorFormCreateInput, ContributorUpdateInput } from '@/lib/services/contributor/contributor.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedContributorOrThrow, getOptionalContributor } from '../firebase/current-contributor';

export const createContributorAction = async (data: ContributorFormCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const res = await services.contributor.create(user.id, data);
	revalidatePath('/portal/management/contributors');
	return res;
};

export const updateContributorAction = async (contributor: ContributorUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const res = await services.contributor.update(user.id, contributor);
	revalidatePath('/portal/management/contributors');
	return res;
};

export const getContributorAction = async (contributorId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	return services.contributor.get(user.id, contributorId);
};

export const getOptionalContributorAction = async () => {
	return getOptionalContributor();
};

export const updateSelfAction = async (data: ContributorUpdateInput) => {
	const contributor = await getAuthenticatedContributorOrThrow();
	const res = await services.contributor.updateSelf(contributor.id, data);
	revalidatePath('/dashboard/profile');
	return res;
};
