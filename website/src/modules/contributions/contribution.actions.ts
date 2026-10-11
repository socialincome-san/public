'use server';

import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import type {
	ContributionFormOptions,
	ContributionPayload,
	GlobeContribution,
} from '@/modules/contributions/contribution.types';
import { revalidatePath } from 'next/cache';
import { getRecentSuccessfulContributions } from './contribution.cache';
import {
	contributionCreateSchema,
	contributionGlobeDaysSchema,
	contributionIdSchema,
	contributionUpdateSchema,
} from './contribution.schemas';
import { createContribution, getContribution, getContributionFormOptions, updateContribution } from './contribution.service';

export const createContributionAction = async (input: unknown): Promise<Result<ContributionPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = contributionCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await createContribution(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/management/contributions');

	return result;
};

export const updateContributionAction = async (input: unknown): Promise<Result<ContributionPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = contributionUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await updateContribution(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/management/contributions');

	return result;
};

export const getContributionAction = async (contributionId: unknown): Promise<Result<ContributionPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const contributionIdResult = contributionIdSchema.safeParse(contributionId);
	if (!contributionIdResult.success) {
		return resultFail('Contribution id is required.');
	}

	return getContribution(sessionResult.data.id, contributionIdResult.data);
};

export const getContributionsOptionsAction = async (): Promise<Result<ContributionFormOptions>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getContributionFormOptions(sessionResult.data.id);
};

export const getRecentSuccessfulContributionsAction = async (days: unknown): Promise<Result<GlobeContribution[]>> => {
	const daysResult = contributionGlobeDaysSchema.safeParse(days);
	if (!daysResult.success) {
		return resultFail('Invalid number of days.');
	}

	return getRecentSuccessfulContributions(daysResult.data);
};
