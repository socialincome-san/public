'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail, resultOk } from '@/lib/service-result';
import { getLocalPartnerOptions } from '@/modules/local-partners/local-partner.service';
import { revalidatePath } from 'next/cache';
import {
	candidateCountSchema,
	candidateCreateSchema,
	candidateCsvFileSchema,
	candidateIdSchema,
	candidateSessionTypeSchema,
	candidateUpdateSchema,
} from './candidate.schemas';
import {
	createCandidate,
	deleteCandidate,
	exportCandidatesCsv,
	getCandidate,
	getCandidateCount,
	importCandidatesCsv,
	updateCandidate,
} from './candidate.service';

const ADMIN_CANDIDATES_PATH = '/portal/admin/candidates';
const PARTNER_CANDIDATES_PATH = '/partner-space/candidates';

export const createCandidateAction = async (input: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getCandidateActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = candidateCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await createCandidate(sessionResult.data, inputResult.data);
	revalidateCandidatePaths(sessionResult.data.type);

	return result;
};

export const updateCandidateAction = async (input: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getCandidateActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const inputResult = candidateUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updateCandidate(sessionResult.data, inputResult.data);
	revalidateCandidatePaths(sessionResult.data.type);

	return result;
};

export const deleteCandidateAction = async (candidateId: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getCandidateActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const idResult = candidateIdSchema.safeParse(candidateId);
	if (!idResult.success) {
		return resultFail(idResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await deleteCandidate(sessionResult.data, idResult.data);
	revalidateCandidatePaths(sessionResult.data.type);

	return result;
};

export const getCandidateAction = async (candidateId: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getCandidateActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const idResult = candidateIdSchema.safeParse(candidateId);
	if (!idResult.success) {
		return resultFail(idResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	return getCandidate(sessionResult.data, idResult.data);
};

export const getCandidateOptionsAction = async (sessionType: unknown = 'user') => {
	const sessionTypeResult = candidateSessionTypeSchema.safeParse(sessionType);
	if (!sessionTypeResult.success) {
		return resultFail('Invalid session type');
	}
	if (sessionTypeResult.data !== 'user') {
		return resultOk({ localPartners: [] });
	}
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const localPartnersResult = await getLocalPartnerOptions();
	if (!localPartnersResult.success) {
		return resultFail(localPartnersResult.error);
	}

	return resultOk({ localPartners: localPartnersResult.data });
};

export const getCandidateCountAction = async (focuses: unknown, profiles: unknown, countryId: unknown) => {
	const inputResult = candidateCountSchema.safeParse({ focuses, profiles, countryId });
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	return getCandidateCount(inputResult.data.focuses, inputResult.data.profiles, inputResult.data.countryId);
};

export const importCandidatesCsvAction = async (file: unknown, sessionType: unknown = 'user') => {
	const sessionResult = await getCandidateActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const fileResult = candidateCsvFileSchema.safeParse(file);
	if (!fileResult.success) {
		return resultFail('Invalid CSV file');
	}

	const result = await importCandidatesCsv(sessionResult.data, fileResult.data);
	revalidateCandidatePaths(sessionResult.data.type);

	return result;
};

export const downloadCandidatesCsvAction = async (sessionType: unknown = 'user') => {
	const sessionResult = await getCandidateActionSession(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}

	return exportCandidatesCsv(sessionResult.data);
};

const getCandidateActionSession = async (sessionType: unknown) => {
	const sessionTypeResult = candidateSessionTypeSchema.safeParse(sessionType);
	if (!sessionTypeResult.success) {
		return resultFail('Invalid session type');
	}

	return getSessionByType(sessionTypeResult.data);
};

const revalidateCandidatePaths = (sessionType: 'user' | 'local-partner' | 'contributor'): void => {
	if (sessionType === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (sessionType === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}
};
