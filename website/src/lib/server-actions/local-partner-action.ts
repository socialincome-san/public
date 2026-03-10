'use server';

import { getSessionByType, type Session } from '@/lib/firebase/current-account';
import { LocalPartnerCreateInput, LocalPartnerUpdateInput } from '@/lib/services/local-partner/local-partner.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createLocalPartnerAction = async (localPartner: LocalPartnerCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.localPartner.create(sessionResult.data.id, localPartner);
	revalidatePath('/portal/admin/local-partners');
	return result;
};

export const updateLocalPartnerAction = async (
	updateInput: LocalPartnerUpdateInput,
	sessionType: Session['type'] = 'user',
) => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.localPartner.update(session, updateInput);
	if (session.type === 'user') {
		revalidatePath('/portal/admin/local-partners');
	} else if (session.type === 'local-partner') {
		revalidatePath('/partner-space/profile');
	}
	return result;
};

export const getLocalPartnerAction = async (localPartnerId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.localPartner.get(sessionResult.data.id, localPartnerId);
};
