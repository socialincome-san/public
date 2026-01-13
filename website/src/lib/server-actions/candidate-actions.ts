'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { CandidateService } from '@/lib/services/candidate/candidate.service';
import { CandidateCreateInput, CandidateUpdateInput } from '@/lib/services/candidate/candidate.types';
import { LocalPartnerService } from '@/lib/services/local-partner/local-partner.service';
import { revalidatePath } from 'next/cache';

const candidateService = new CandidateService();
const localPartnerService = new LocalPartnerService();

export async function createCandidateAction(data: CandidateCreateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const result = await candidateService.create(user.id, data);
	revalidatePath('/admin/candidates');
	return result;
}

export async function updateCandidateAction(updateInput: CandidateUpdateInput, nextPaymentPhoneNumber: string | null) {
	const user = await getAuthenticatedUserOrThrow();
	const result = await candidateService.update(user.id, updateInput, nextPaymentPhoneNumber);
	revalidatePath('/admin/candidates');
	return result;
}

export async function getCandidateAction(candidateId: string) {
	const user = await getAuthenticatedUserOrThrow();
	return await candidateService.get(user.id, candidateId);
}

export async function getCandidateOptions() {
	const localPartners = await localPartnerService.getOptions();
	return { localPartners };
}
