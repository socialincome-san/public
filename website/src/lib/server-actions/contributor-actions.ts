'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ContributorService } from '@/lib/services/contributor/contributor.service';
import { ContributorFormCreateInput, ContributorUpdateInput } from '@/lib/services/contributor/contributor.types';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedContributorOrThrow, getOptionalContributor } from '../firebase/current-contributor';

const contributorService = new ContributorService();

export async function createContributorAction(data: ContributorFormCreateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const result = await contributorService.create(user.id, data);
	revalidatePath('/portal/management/contributors');
	return result;
}

export async function updateContributorAction(contributor: ContributorUpdateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const result = await contributorService.update(user.id, contributor);
	revalidatePath('/portal/management/contributors');
	return result;
}

export async function getContributorAction(contributorId: string) {
	const user = await getAuthenticatedUserOrThrow();
	return contributorService.get(user.id, contributorId);
}

export async function getOptionalContributorAction() {
	return getOptionalContributor();
}

export async function updateSelfAction(data: ContributorUpdateInput) {
	const contributor = await getAuthenticatedContributorOrThrow();
	const result = await contributorService.updateSelf(contributor.id, data);
	revalidatePath('/dashboard/profile');
	return result;
}
