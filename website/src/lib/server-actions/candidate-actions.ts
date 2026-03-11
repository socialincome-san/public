'use server';

import { Cause } from '@/generated/prisma/enums';
import { getSessionByType, type Session } from '@/lib/firebase/current-account';
import { CandidateCreateInput, CandidateUpdateInput, Profile } from '@/lib/services/candidate/candidate.types';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const ADMIN_CANDIDATES_PATH = '/admin/candidates';
const PARTNER_CANDIDATES_PATH = '/partner-space/candidates';

export const createCandidateAction = async (data: CandidateCreateInput, sessionType: Session['type'] = 'user') => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.candidate.create(session, data);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
};

export const updateCandidateAction = async (
	updateInput: CandidateUpdateInput,
	nextPaymentPhoneNumber: string | null,
	sessionType: Session['type'] = 'user',
) => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.candidate.update(session, updateInput, nextPaymentPhoneNumber);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
};

export const deleteCandidateAction = async (candidateId: string, sessionType: Session['type'] = 'user') => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.candidate.delete(session, candidateId);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
};

export const getCandidateAction = async (candidateId: string, sessionType: Session['type'] = 'user') => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;

	return await services.read.candidate.get(session, candidateId);
};

export const getCandidateOptions = async (sessionType: Session['type'] = 'user') => {
	if (sessionType !== 'user') {
		return resultOk({ localPartners: [] });
	}
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const localPartners = await services.read.localPartner.getOptions();
	if (!localPartners.success) {
		return resultFail(localPartners.error);
	}

	return resultOk({ localPartners: localPartners.data });
};

export const getCandidateCountAction = async (causes: Cause[], profiles: Profile[], countryId: string | null) => {
	return services.read.candidate.getCandidateCount(causes, profiles, countryId);
};

export const importCandidatesCsvAction = async (file: File, sessionType: Session['type'] = 'user') => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.candidate.importCsv(session, file);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
};

export const downloadCandidatesCsvAction = async (sessionType: Session['type'] = 'user') => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;

	return services.read.candidate.exportCsv(session);
};
