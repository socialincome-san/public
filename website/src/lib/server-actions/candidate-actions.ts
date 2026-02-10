'use server';

import { Cause } from '@/generated/prisma/enums';
import { getActorOrThrow } from '@/lib/firebase/current-account';
import { CandidateService } from '@/lib/services/candidate/candidate.service';
import { CandidateCreateInput, CandidateUpdateInput, Profile } from '@/lib/services/candidate/candidate.types';
import { LocalPartnerService } from '@/lib/services/local-partner/local-partner.service';
import { revalidatePath } from 'next/cache';

const ADMIN_CANDIDATES_PATH = '/admin/candidates';
const PARTNER_CANDIDATES_PATH = '/partner-space/candidates';

const candidateService = new CandidateService();
const localPartnerService = new LocalPartnerService();

export async function createCandidateAction(data: CandidateCreateInput) {
	const actor = await getActorOrThrow();

	const result = await candidateService.create(actor, data);

	if (actor.kind === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
}

export async function updateCandidateAction(updateInput: CandidateUpdateInput, nextPaymentPhoneNumber: string | null) {
	const actor = await getActorOrThrow();

	const result = await candidateService.update(actor, updateInput, nextPaymentPhoneNumber);

	if (actor.kind === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
}

export async function getCandidateAction(candidateId: string) {
	const actor = await getActorOrThrow();
	return await candidateService.get(actor, candidateId);
}

export async function getCandidateOptions() {
	const actor = await getActorOrThrow();

	if (actor.kind === 'user') {
		const localPartners = await localPartnerService.getOptions();
		return { localPartners };
	}

	return { localPartners: { success: true, data: [] } };
}

export async function getCandidateCountAction(causes: Cause[], profiles: Profile[], countryId: string | null) {
	// Todo: filter by countryId as soon as this one is merged: https://github.com/socialincome-san/public/pull/1684
	return candidateService.getCandidateCount(causes, profiles);
}

export async function importCandidatesCsvAction(file: File) {
	const actor = await getActorOrThrow();

	const result = await candidateService.importCsv(actor, file);

	if (actor.kind === 'user') {
		revalidatePath(ADMIN_CANDIDATES_PATH);
	} else if (actor.kind === 'local-partner') {
		revalidatePath(PARTNER_CANDIDATES_PATH);
	}

	return result;
}
