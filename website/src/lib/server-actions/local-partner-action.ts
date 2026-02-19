'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { LocalPartnerService } from '@/lib/services/local-partner/local-partner.service';
import { LocalPartnerCreateInput, LocalPartnerUpdateInput } from '@/lib/services/local-partner/local-partner.types';
import { revalidatePath } from 'next/cache';
import { getActorOrThrow } from '../firebase/current-account';

const localPartnerService = new LocalPartnerService();

export const createLocalPartnerAction = async (localPartner: LocalPartnerCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const result = await localPartnerService.create(user.id, localPartner);

	revalidatePath('/portal/admin/local-partners');
	return result;
}

export const updateLocalPartnerAction = async (updateInput: LocalPartnerUpdateInput) => {
	const actor = await getActorOrThrow();

	const result = await localPartnerService.update(actor, updateInput);

	if (actor.kind === 'user') {
		revalidatePath('/portal/admin/local-partners');
	} else if (actor.kind === 'local-partner') {
		revalidatePath('/partner-space/profile');
	}

	return result;
}

export const getLocalPartnerAction = async (localPartnerId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	return localPartnerService.get(user.id, localPartnerId);
}
