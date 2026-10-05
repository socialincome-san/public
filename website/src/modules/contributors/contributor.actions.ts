'use server';

import { resultFail, type Result } from '@/lib/result';
import { getOptionalContributor, getSessionByType } from '@/modules/auth/session.service';
import type {
	ContributorCommunityStats,
	ContributorPayload,
	ContributorRecord,
	ContributorSession,
} from '@/modules/contributors/contributor.types';
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

export const createContributorAction = async (input: unknown): Promise<Result<ContributorRecord>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = contributorCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await createContributor(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/management/contributors');

	return result;
};

export const updateContributorAction = async (input: unknown): Promise<Result<ContributorRecord>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = contributorUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await updateContributor(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/management/contributors');

	return result;
};

export const getContributorAction = async (contributorId: unknown): Promise<Result<ContributorPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const contributorIdResult = contributorIdSchema.safeParse(contributorId);
	if (!contributorIdResult.success) {
		return resultFail('Contributor id is required.');
	}

	return getContributor(sessionResult.data.id, contributorIdResult.data);
};

export const getOptionalContributorAction = async (): Promise<Result<ContributorSession | null>> => getOptionalContributor();

export const updateContributorSelfAction = async (input: unknown): Promise<Result<ContributorRecord>> => {
	const sessionResult = await getSessionByType('contributor');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = contributorSelfUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await updateContributorSelf(sessionResult.data.id, inputResult.data);
	revalidatePath('/dashboard/profile');

	return result;
};

export const getContributorCommunityStatsAction = async (): Promise<Result<ContributorCommunityStats>> =>
	getCommunityStats();
