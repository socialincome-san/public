'use server';

import { getSessionByTypeOrThrow, type Session } from '@/lib/firebase/current-account';
import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { LocalPartnerCreateInput, LocalPartnerUpdateInput } from '@/lib/services/local-partner/local-partner.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createLocalPartnerAction = async (localPartner: LocalPartnerCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const result = await services.write.localPartner.create(user.id, localPartner);
	revalidatePath('/portal/admin/local-partners');
	return result;
};

export const updateLocalPartnerAction = async (
	updateInput: LocalPartnerUpdateInput,
	sessionType: Session['type'] = 'user',
) => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await services.write.localPartner.update(session, updateInput);
	if (session.type === 'user') {
		revalidatePath('/portal/admin/local-partners');
	} else if (session.type === 'local-partner') {
		revalidatePath('/partner-space/profile');
	}
	return result;
};

export const getLocalPartnerAction = async (localPartnerId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	return services.read.localPartner.get(user.id, localPartnerId);
};
