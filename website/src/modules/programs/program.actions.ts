'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import { revalidatePath } from 'next/cache';
import {
	calculateProgramBudget,
	getProgramDashboardStats,
	resolveProgramFinancesDisplayAmounts,
} from './program-stats.service';
import {
	programBudgetCalculationSchema,
	programCreateSchema,
	programDisplayCurrencySchema,
	programFinancesStatsSchema,
	programIdSchema,
	programSettingsUpdateSchema,
	programSlugSchema,
	programSlugsSchema,
	publicOnboardingUserDetailsSchema,
} from './program.schemas';
import {
	createProgram,
	deleteProgram,
	getProgramIdByPortalSlug,
	getProgramOrganizationOptions,
	getProgramSettings,
	getProgramSlugById,
	getProgramWallets,
	getPublicPreviewProgramBySlug,
	getPublicProgramBySlug,
	getPublicProgramFilterDataByPortalSlugs,
	getPublicProgramStatsById,
	getPublicProgramStatsByProgramPortalSlugs,
	getPublicTargetFocusesByProgramId,
	updateProgramSettings,
} from './program.service';

export const createProgramAction = async (input: unknown, userDetails?: unknown) => {
	const parsedInput = programCreateSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid program input.');
	}

	const sessionResult = await getSessionByType('user');
	if (sessionResult.success) {
		return createProgram(parsedInput.data, { userId: sessionResult.data.id });
	}
	const parsedUserDetails = publicOnboardingUserDetailsSchema.safeParse(userDetails);
	if (!parsedUserDetails.success) {
		return sessionResult;
	}

	return createProgram(parsedInput.data, parsedUserDetails.data);
};

export const getProgramSettingsAction = async (programId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedProgramId = programIdSchema.safeParse(programId);

	return parsedProgramId.success
		? getProgramSettings(sessionResult.data.id, parsedProgramId.data)
		: resultFail('Invalid program id.');
};

export const getCurrentProgramWalletsAction = async () => {
	const sessionResult = await getSessionByType('user');

	return sessionResult.success ? getProgramWallets(sessionResult.data.id) : sessionResult;
};

export const getProgramOrganizationOptionsAction = async (programId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedProgramId = programIdSchema.safeParse(programId);

	return parsedProgramId.success
		? getProgramOrganizationOptions(sessionResult.data.id, parsedProgramId.data)
		: resultFail('Invalid program id.');
};

export const updateProgramSettingsAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = programSettingsUpdateSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid program input.');
	}

	const result = await updateProgramSettings(sessionResult.data.id, parsedInput.data);
	if (result.success) {
		revalidatePath('/portal/programs/[programId]', 'layout');
	}

	return result;
};

export const deleteProgramAction = async (programId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedProgramId = programIdSchema.safeParse(programId);
	if (!parsedProgramId.success) {
		return resultFail('Invalid program id.');
	}

	const result = await deleteProgram(sessionResult.data.id, parsedProgramId.data);
	if (result.success) {
		revalidatePath('/portal');
		revalidatePath('/portal/programs/[programId]', 'layout');
	}

	return result;
};

export const calculateProgramBudgetAction = async (input: unknown) => {
	const parsedInput = programBudgetCalculationSchema.safeParse(input);

	return parsedInput.success
		? calculateProgramBudget(parsedInput.data)
		: resultFail(parsedInput.error.issues[0]?.message ?? 'Invalid program budget input.');
};

export const getPublicProgramFilterDataByPortalSlugsAction = async (slugs: unknown) => {
	const parsedSlugs = programSlugsSchema.safeParse(slugs);

	return parsedSlugs.success
		? getPublicProgramFilterDataByPortalSlugs(parsedSlugs.data)
		: resultFail('Invalid program slugs.');
};

export const getPublicProgramStatsByPortalSlugsAction = async (slugs: unknown) => {
	const parsedSlugs = programSlugsSchema.safeParse(slugs);

	return parsedSlugs.success
		? getPublicProgramStatsByProgramPortalSlugs(parsedSlugs.data)
		: resultFail('Invalid program slugs.');
};

export const getPublicProgramStatsByIdAction = async (programId: unknown) => {
	const parsedProgramId = programIdSchema.safeParse(programId);

	return parsedProgramId.success ? getPublicProgramStatsById(parsedProgramId.data) : resultFail('Invalid program id.');
};

export const getPublicTargetFocusesByProgramIdAction = async (programId: unknown) => {
	const parsedProgramId = programIdSchema.safeParse(programId);

	return parsedProgramId.success
		? getPublicTargetFocusesByProgramId(parsedProgramId.data)
		: resultFail('Invalid program id.');
};

export const getProgramIdByPortalSlugAction = async (slug: unknown) => {
	const parsedSlug = programSlugSchema.safeParse(slug);

	return parsedSlug.success ? getProgramIdByPortalSlug(parsedSlug.data) : resultFail('Invalid program slug.');
};

export const getProgramSlugByIdAction = async (programId: unknown) => {
	const parsedProgramId = programIdSchema.safeParse(programId);

	return parsedProgramId.success ? getProgramSlugById(parsedProgramId.data) : resultFail('Invalid program id.');
};

export const getPublicProgramBySlugAction = async (slug: unknown) => {
	const parsedSlug = programSlugSchema.safeParse(slug);

	return parsedSlug.success ? getPublicProgramBySlug(parsedSlug.data) : resultFail('Invalid program slug.');
};

export const getPublicPreviewProgramBySlugAction = async (slug: unknown) => {
	const parsedSlug = programSlugSchema.safeParse(slug);

	return parsedSlug.success ? getPublicPreviewProgramBySlug(parsedSlug.data) : resultFail('Invalid program slug.');
};

export const getProgramDashboardStatsAction = async (programId: unknown) => {
	const parsedProgramId = programIdSchema.safeParse(programId);

	return parsedProgramId.success ? getProgramDashboardStats(parsedProgramId.data) : resultFail('Invalid program id.');
};

export const resolveProgramFinancesDisplayAmountsAction = async (input: unknown, displayCurrency: unknown) => {
	const parsedStats = programFinancesStatsSchema.safeParse(input);
	const parsedDisplayCurrency = programDisplayCurrencySchema.safeParse(displayCurrency);
	if (!parsedStats.success || !parsedDisplayCurrency.success) {
		return resultFail('Invalid program finances input.');
	}

	return resolveProgramFinancesDisplayAmounts(parsedStats.data, parsedDisplayCurrency.data);
};
