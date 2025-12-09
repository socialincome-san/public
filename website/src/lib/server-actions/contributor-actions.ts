'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ContributorService } from '@/lib/services/contributor/contributor.service';
import { ContributorFormCreateInput, ContributorUpdateInput } from '@/lib/services/contributor/contributor.types';
import { revalidatePath } from 'next/cache';
import { getOptionalContributor } from '../firebase/current-contributor';

export async function createContributorAction(data: ContributorFormCreateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const contributorService = new ContributorService();

	const res = await contributorService.create(user.id, data);
	revalidatePath('/portal/management/contributors');
	return res;
}

export async function updateContributorAction(contributor: ContributorUpdateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const contributorService = new ContributorService();

	const res = await contributorService.update(user.id, contributor);
	revalidatePath('/portal/management/contributors');
	return res;
}

export async function getContributorAction(contributorId: string) {
	const user = await getAuthenticatedUserOrThrow();
	const contributorService = new ContributorService();

	return await contributorService.get(user.id, contributorId);
}

export async function getOptionalContributorAction() {
	return await getOptionalContributor();
}

export async function updateSelfAction(contributorId: string, data: ContributorUpdateInput) {
	const contributorService = new ContributorService();

	const res = await contributorService.updateSelf(contributorId, data);
	revalidatePath('/dashboard/profile');
	return res;
}
