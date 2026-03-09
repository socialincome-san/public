'use server';

import { Cause } from '@/generated/prisma/enums';
import { getSessionByTypeOrThrow, type Session } from '@/lib/firebase/current-account';
import { CandidateCreateInput, CandidateUpdateInput, Profile } from '@/lib/services/candidate/candidate.types';
import { getServices } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const ADMIN_CANDIDATES_PATH = '/admin/candidates';
const PARTNER_CANDIDATES_PATH = '/partner-space/candidates';

export const createCandidateAction = async (data: CandidateCreateInput, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await getServices().candidateWrite.create(session, data);
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
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await getServices().candidateWrite.update(session, updateInput, nextPaymentPhoneNumber);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}
	return result;
};

export const deleteCandidateAction = async (candidateId: string, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await getServices().candidateWrite.delete(session, candidateId);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}
	return result;
};

export const getCandidateAction = async (candidateId: string, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	return await getServices().candidateRead.get(session, candidateId);
};

export const getCandidateOptions = async (sessionType: Session['type'] = 'user') => {
	if (sessionType !== 'user') {
		return { localPartners: { success: true, data: [] } };
	}
	const session = await getSessionByTypeOrThrow('user');
	const localPartners = await getServices().localPartnerRead.getOptions();
	return { localPartners };
};

export const getCandidateCountAction = async (causes: Cause[], profiles: Profile[], countryId: string | null) => {
	return getServices().candidateRead.getCandidateCount(causes, profiles, countryId);
};

export const importCandidatesCsvAction = async (file: File, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await getServices().candidateWrite.importCsv(session, file);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}
	return result;
};

export const downloadCandidatesCsvAction = async (sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	return getServices().candidateRead.exportCsv(session);
};
