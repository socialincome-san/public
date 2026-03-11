'use server';

import { getSessionByType, type Session } from '@/lib/firebase/current-account';
import { ROUTES } from '@/lib/constants/routes';
import {
	LocalPartnerFormCreateInput,
	LocalPartnerFormUpdateInput,
} from '@/lib/services/local-partner/local-partner-form-input';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createLocalPartnerAction = async (localPartner: LocalPartnerFormCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const result = await services.write.localPartner.create(sessionResult.data.id, localPartner);
	revalidatePath(ROUTES.portalAdminLocalPartners);
	return result;
};

export const updateLocalPartnerAction = async (
	updateInput: LocalPartnerFormUpdateInput,
	sessionType: Session['type'] = 'user',
) => {
	const sessionResult = await getSessionByType(sessionType);
	if (!sessionResult.success) {
		return sessionResult;
	}
	const session = sessionResult.data;
	const result = await services.write.localPartner.update(session, updateInput);
	if (session.type === 'user') {
		revalidatePath(ROUTES.portalAdminLocalPartners);
	} else if (session.type === 'local-partner') {
		revalidatePath(ROUTES.partnerSpaceProfile);
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

export const deleteLocalPartnerAction = async (localPartnerId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const result = await services.write.localPartner.delete(sessionResult.data.id, localPartnerId);
	revalidatePath(ROUTES.portalAdminLocalPartners);
	return result;
};
