'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { getOptionalContributor } from '@/lib/firebase/current-contributor';
import { resultFail, resultOk } from '@/lib/service-result';
import { revalidatePath } from 'next/cache';
import {
	contributorCreateSchema,
	contributorIdSchema,
	contributorSelfUpdateSchema,
	contributorUpdateSchema,
} from './contributor.schemas';
import {
	createContributor,
	getCommunityStats,
	getContributor,
	updateContributor,
	updateContributorSelf,
} from './contributor.service';

export const createContributorAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = contributorCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await createContributor(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/management/contributors');

	return result;
};

export const updateContributorAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = contributorUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updateContributor(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/management/contributors');

	return result;
};

export const getContributorAction = async (contributorId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const contributorIdResult = contributorIdSchema.safeParse(contributorId);
	if (!contributorIdResult.success) {
		return resultFail(contributorIdResult.error.issues[0]?.message ?? 'Contributor id is required.');
	}

	return getContributor(sessionResult.data.id, contributorIdResult.data);
};

export const getOptionalContributorAction = async () => resultOk(await getOptionalContributor());

export const updateContributorSelfAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = contributorSelfUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updateContributorSelf(sessionResult.data.id, inputResult.data);
	revalidatePath('/dashboard/profile');

	return result;
};

export const getContributorCommunityStatsAction = async () => getCommunityStats();
