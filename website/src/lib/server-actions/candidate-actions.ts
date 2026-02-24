'use server';

import { Cause } from '@/generated/prisma/enums';
import { getSessionByTypeOrThrow, type Session } from '@/lib/firebase/current-account';
import { CandidateService } from '@/lib/services/candidate/candidate.service';
import { CandidateCreateInput, CandidateUpdateInput, Profile } from '@/lib/services/candidate/candidate.types';
import { LocalPartnerService } from '@/lib/services/local-partner/local-partner.service';
import { revalidatePath } from 'next/cache';

const ADMIN_CANDIDATES_PATH = '/admin/candidates';
const PARTNER_CANDIDATES_PATH = '/partner-space/candidates';

const candidateService = new CandidateService();
const localPartnerService = new LocalPartnerService();

export const createCandidateAction = async (data: CandidateCreateInput, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await candidateService.create(session, data);
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
	const result = await candidateService.update(session, updateInput, nextPaymentPhoneNumber);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}
	return result;
};

export const deleteCandidateAction = async (candidateId: string, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await candidateService.delete(session, candidateId);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}
	return result;
};

export const getCandidateAction = async (candidateId: string, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	return await candidateService.get(session, candidateId);
};

export const getCandidateOptions = async (sessionType: Session['type'] = 'user') => {
	if (sessionType !== 'user') {
		return { localPartners: { success: true, data: [] } };
	}
	const session = await getSessionByTypeOrThrow('user');
	const localPartners = await localPartnerService.getOptions();
	return { localPartners };
};

export const getCandidateCountAction = async (causes: Cause[], profiles: Profile[], countryId: string | null) => {
	return candidateService.getCandidateCount(causes, profiles, countryId);
};

export const importCandidatesCsvAction = async (file: File, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await candidateService.importCsv(session, file);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}
	return result;
};
