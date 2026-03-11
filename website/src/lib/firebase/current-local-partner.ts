import { ROUTES } from '@/lib/constants/routes';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { services } from '@/lib/services/services';
import { redirect } from 'next/navigation';
import { cache } from 'react';

const loadCurrentLocalPartner = async (): Promise<LocalPartnerSession | null> => {
	const cookieResult = await services.firebaseSession.readSessionCookie();
	if (!cookieResult.success || !cookieResult.data) {
		return null;
	}

	const decodedTokenResult = await services.firebaseSession.verifySessionCookie(cookieResult.data);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	const result = await services.read.localPartner.getCurrentLocalPartnerSession(authUserId);
	return result.success ? result.data : null;
};

const getCurrentLocalPartner = cache(loadCurrentLocalPartner);

export const getAuthenticatedLocalPartnerOrRedirect = async (): Promise<LocalPartnerSession> => {
	const partner = await getCurrentLocalPartner();
	if (!partner) {
		redirect(ROUTES.login);
	}
	return partner;
};
