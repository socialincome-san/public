'use server';

import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import type {
	LocalPartnerDashboardStats,
	LocalPartnerPayload,
	LocalPartnerPrograms,
	PublicLocalPartnerOverviewStatsMap,
	PublicProgramLocalPartner,
} from '@/modules/local-partners/local-partner.types';
import { revalidatePath } from 'next/cache';
import {
	getLocalPartnerDashboardStats,
	getLocalPartnerOverviewStats,
	getLocalPartnerProgramSummaries,
} from './local-partner-public.service';
import {
	localPartnerCreateSchema,
	localPartnerDashboardSlugSchema,
	localPartnerIdSchema,
	localPartnerOverviewSlugsSchema,
	localPartnerProgramSummariesSchema,
	localPartnerSessionTypeSchema,
	localPartnerUpdateSchema,
} from './local-partner.schemas';
import {
	createLocalPartner,
	deleteLocalPartner,
	getLocalPartner,
	getPublicLocalPartnersByProgramId,
	updateLocalPartner,
} from './local-partner.service';

export const createLocalPartnerAction = async (input: unknown): Promise<Result<LocalPartnerPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = localPartnerCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await createLocalPartner(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/admin/local-partners');

	return result;
};

export const updateLocalPartnerAction = async (
	input: unknown,
	sessionType: unknown = 'user',
): Promise<Result<LocalPartnerPayload>> => {
	const sessionTypeResult = localPartnerSessionTypeSchema.safeParse(sessionType);
	if (!sessionTypeResult.success) {
		return resultFail('Invalid session type');
	}
	const sessionResult = await getSessionByType(sessionTypeResult.data);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = localPartnerUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await updateLocalPartner(sessionResult.data, inputResult.data);
	if (sessionResult.data.type === 'user') {
		revalidatePath('/portal/admin/local-partners');
	} else if (sessionResult.data.type === 'local-partner') {
		revalidatePath('/partner-space/profile');
	}

	return result;
};

export const getLocalPartnerAction = async (localPartnerId: unknown): Promise<Result<LocalPartnerPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const idResult = localPartnerIdSchema.safeParse(localPartnerId);
	if (!idResult.success) {
		return resultFail('Invalid input.');
	}

	return getLocalPartner(sessionResult.data.id, idResult.data);
};

export const deleteLocalPartnerAction = async (localPartnerId: unknown): Promise<Result<{ id: string }>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const idResult = localPartnerIdSchema.safeParse(localPartnerId);
	if (!idResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await deleteLocalPartner(sessionResult.data.id, idResult.data);
	revalidatePath('/portal/admin/local-partners');

	return result;
};

export const getPublicLocalPartnersByProgramIdAction = async (
	programId: unknown,
): Promise<Result<PublicProgramLocalPartner[]>> => {
	const idResult = localPartnerIdSchema.safeParse(programId);
	if (!idResult.success) {
		return resultFail('Missing program id');
	}

	return getPublicLocalPartnersByProgramId(idResult.data);
};

export const getLocalPartnerDashboardStatsAction = async (input: unknown): Promise<Result<LocalPartnerDashboardStats>> => {
	const parsedInput = localPartnerDashboardSlugSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid local partner slug');
	}

	return getLocalPartnerDashboardStats(parsedInput.data);
};

export const getLocalPartnerOverviewStatsAction = async (
	input: unknown,
): Promise<Result<PublicLocalPartnerOverviewStatsMap>> => {
	const parsedInput = localPartnerOverviewSlugsSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid local partner slugs');
	}

	return getLocalPartnerOverviewStats(parsedInput.data);
};

export const getLocalPartnerProgramSummariesAction = async (input: unknown): Promise<Result<LocalPartnerPrograms>> => {
	const parsedInput = localPartnerProgramSummariesSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid local partner programs request');
	}

	return getLocalPartnerProgramSummaries(
		parsedInput.data.lang,
		parsedInput.data.localPartnerPortalSlug,
		parsedInput.data.countryIsoCode,
	);
};
