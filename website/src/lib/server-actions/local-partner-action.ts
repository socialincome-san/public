'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { LocalPartnerCreateInput, LocalPartnerUpdateInput } from '@/lib/services/local-partner/local-partner.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';
import { getActorOrThrow } from '../firebase/current-account';

export const createLocalPartnerAction = async (localPartner: LocalPartnerCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const result = await services.localPartner.create(user.id, localPartner);

	revalidatePath('/portal/admin/local-partners');
	return result;
};

export const updateLocalPartnerAction = async (updateInput: LocalPartnerUpdateInput) => {
	const actor = await getActorOrThrow();

	const result = await services.localPartner.update(actor, updateInput);

	if (actor.kind === 'user') {
		revalidatePath('/portal/admin/local-partners');
	} else if (actor.kind === 'local-partner') {
		revalidatePath('/partner-space/profile');
	}

	return result;
};

export const getLocalPartnerAction = async (localPartnerId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	return services.localPartner.get(user.id, localPartnerId);
};
