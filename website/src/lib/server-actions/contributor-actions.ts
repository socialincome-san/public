'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { ContributorFormCreateInput, ContributorFormUpdateInput } from '@/lib/services/contributor/contributor-form-input';
import { ContributorUpdateInput } from '@/lib/services/contributor/contributor.types';
import { resultOk } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';
import { getOptionalContributor } from '../firebase/current-contributor';

export const createContributorAction = async (data: ContributorFormCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.contributor.create(sessionResult.data.id, data);
	revalidatePath('/portal/management/contributors');

	return res;
};

export const updateContributorAction = async (contributor: ContributorFormUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.contributor.update(sessionResult.data.id, contributor);
	revalidatePath('/portal/management/contributors');

	return res;
};

export const getContributorAction = async (contributorId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.read.contributor.get(sessionResult.data.id, contributorId);
};

export const getOptionalContributorAction = async () => {
	return resultOk(await getOptionalContributor());
};

export const updateSelfAction = async (data: ContributorUpdateInput) => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.contributor.updateSelf(sessionResult.data.id, data);
	revalidatePath('/dashboard/profile');

	return res;
};
