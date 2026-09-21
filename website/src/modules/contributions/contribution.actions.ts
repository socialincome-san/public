'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import { revalidatePath } from 'next/cache';
import {
	contributionCreateSchema,
	contributionGlobeCutoffSchema,
	contributionIdSchema,
	contributionUpdateSchema,
} from './contribution.schemas';
import {
	createContribution,
	getContribution,
	getContributionFormOptions,
	getRecentSuccessfulContributions,
	updateContribution,
} from './contribution.service';

export const createContributionAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = contributionCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await createContribution(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/management/contributions');

	return result;
};

export const updateContributionAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = contributionUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updateContribution(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/management/contributions');

	return result;
};

export const getContributionAction = async (contributionId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const contributionIdResult = contributionIdSchema.safeParse(contributionId);
	if (!contributionIdResult.success) {
		return resultFail(contributionIdResult.error.issues[0]?.message ?? 'Contribution id is required.');
	}

	return getContribution(sessionResult.data.id, contributionIdResult.data);
};

export const getContributionsOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getContributionFormOptions(sessionResult.data.id);
};

export const getRecentSuccessfulContributionsAction = async (cutoff: unknown) => {
	const cutoffResult = contributionGlobeCutoffSchema.safeParse(cutoff);
	if (!cutoffResult.success) {
		return resultFail(cutoffResult.error.issues[0]?.message ?? 'Invalid cutoff date.');
	}

	return getRecentSuccessfulContributions(cutoffResult.data);
};
