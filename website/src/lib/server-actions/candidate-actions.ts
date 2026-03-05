'use server';

import { Cause } from '@/generated/prisma/enums';
import { getSessionByTypeOrThrow, type Session } from '@/lib/firebase/current-account';
import { CandidateReadService } from '@/lib/services/candidate/candidate-read.service';
import { CandidateWriteService } from '@/lib/services/candidate/candidate-write.service';
import { CandidateCreateInput, CandidateUpdateInput, Profile } from '@/lib/services/candidate/candidate.types';
import { LocalPartnerReadService } from '@/lib/services/local-partner/local-partner-read.service';
import { revalidatePath } from 'next/cache';

const ADMIN_CANDIDATES_PATH = '/admin/candidates';
const PARTNER_CANDIDATES_PATH = '/partner-space/candidates';

const candidateReadService = new CandidateReadService();
const candidateWriteService = new CandidateWriteService();
const localPartnerService = new LocalPartnerReadService();

export const createCandidateAction = async (data: CandidateCreateInput, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await candidateWriteService.create(session, data);
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
	const result = await candidateWriteService.update(session, updateInput, nextPaymentPhoneNumber);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}
	return result;
};

export const deleteCandidateAction = async (candidateId: string, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await candidateWriteService.delete(session, candidateId);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}
	return result;
};

export const getCandidateAction = async (candidateId: string, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	return await candidateReadService.get(session, candidateId);
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
	return candidateReadService.getCandidateCount(causes, profiles, countryId);
};

export const importCandidatesCsvAction = async (file: File, sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await candidateWriteService.importCsv(session, file);
	if (session.type === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (session.type === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}
	return result;
};

export const downloadCandidatesCsvAction = async (sessionType: Session['type'] = 'user') => {
	const session = await getSessionByTypeOrThrow(sessionType);
	return candidateReadService.exportCsv(session);
};
