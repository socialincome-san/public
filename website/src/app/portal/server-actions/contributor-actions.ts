'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { ContributorService } from '@socialincome/shared/src/database/services/contributor/contributor.service';
import { ContributorUpdateInput } from '@socialincome/shared/src/database/services/contributor/contributor.types';
import { revalidatePath } from 'next/cache';

export async function updateContributorAction(recipient: ContributorUpdateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const contributorService = new ContributorService();

	const res = await contributorService.update(user.id, recipient);
	revalidatePath('/portal/management/contributors');
	return res;
}

export async function getContributorAction(contributorId: string) {
	const user = await getAuthenticatedUserOrThrow();
	const contributorService = new ContributorService();

	return await contributorService.get(user.id, contributorId);
}
