'use server';

import { Cause } from '@/generated/prisma/enums';
import { getActorOrThrow } from '@/lib/firebase/current-account';
import { CandidateCreateInput, CandidateUpdateInput, Profile } from '@/lib/services/candidate/candidate.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const ADMIN_CANDIDATES_PATH = '/admin/candidates';
const PARTNER_CANDIDATES_PATH = '/partner-space/candidates';

export const createCandidateAction = async (data: CandidateCreateInput) => {
	const actor = await getActorOrThrow();

	const result = await services.candidate.create(actor, data);

	if (actor.kind === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
};

export const updateCandidateAction = async (
	updateInput: CandidateUpdateInput,
	nextPaymentPhoneNumber: string | null,
) => {
	const actor = await getActorOrThrow();

	const result = await services.candidate.update(actor, updateInput, nextPaymentPhoneNumber);

	if (actor.kind === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
};

export const deleteCandidateAction = async (candidateId: string) => {
	const actor = await getActorOrThrow();

	const result = await services.candidate.delete(actor, candidateId);

	if (actor.kind === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
};

export const getCandidateAction = async (candidateId: string) => {
	const actor = await getActorOrThrow();
	return await services.candidate.get(actor, candidateId);
};

export const getCandidateOptions = async () => {
	const actor = await getActorOrThrow();

	if (actor.kind === 'user') {
		const localPartners = await services.localPartner.getOptions();
		return { localPartners };
	}

	return { localPartners: { success: true, data: [] } };
};

export const getCandidateCountAction = async (causes: Cause[], profiles: Profile[], countryId: string | null) => {
	return services.candidate.getCandidateCount(causes, profiles, countryId);
};

export const importCandidatesCsvAction = async (file: File) => {
	const actor = await getActorOrThrow();

	const result = await services.candidate.importCsv(actor, file);

	if (actor.kind === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
};
