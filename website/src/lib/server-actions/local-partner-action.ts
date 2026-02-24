'use server';

import { getSessionByTypeOrThrow, type Session } from '@/lib/firebase/current-account';
import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { LocalPartnerService } from '@/lib/services/local-partner/local-partner.service';
import { LocalPartnerCreateInput, LocalPartnerUpdateInput } from '@/lib/services/local-partner/local-partner.types';
import { revalidatePath } from 'next/cache';

const localPartnerService = new LocalPartnerService();

export const createLocalPartnerAction = async (localPartner: LocalPartnerCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const result = await localPartnerService.create(user.id, localPartner);
	revalidatePath('/portal/admin/local-partners');
	return result;
};

export const updateLocalPartnerAction = async (
	updateInput: LocalPartnerUpdateInput,
	sessionType: Session['type'] = 'user',
) => {
	const session = await getSessionByTypeOrThrow(sessionType);
	const result = await localPartnerService.update(session, updateInput);
	if (session.type === 'user') {
		revalidatePath('/portal/admin/local-partners');
	} else if (session.type === 'local-partner') {
		revalidatePath('/partner-space/profile');
	}
	return result;
};

export const getLocalPartnerAction = async (localPartnerId: string) => {
	const user = await getAuthenticatedUserOrThrow();
	return localPartnerService.get(user.id, localPartnerId);
};
