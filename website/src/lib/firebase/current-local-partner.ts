import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { getServices } from '@/lib/services/services';
import { redirect } from 'next/navigation';
import { cache } from 'react';

const loadCurrentLocalPartner = async (): Promise<LocalPartnerSession | null> => {
	const cookie = await getServices().firebaseSession.readSessionCookie();
	if (!cookie) {
		return null;
	}

	const decodedTokenResult = await getServices().firebaseSession.verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	const result = await getServices().localPartnerRead.getCurrentLocalPartnerSession(authUserId);
	return result.success ? result.data : null;
};

const getCurrentLocalPartner = cache(loadCurrentLocalPartner);

export const getAuthenticatedLocalPartnerOrRedirect = async (): Promise<LocalPartnerSession> => {
	const partner = await getCurrentLocalPartner();
	if (!partner) {
		redirect('/login');
	}
	return partner;
};

const getCurrentLocalPartner = cache(loadCurrentLocalPartner);

export const getAuthenticatedLocalPartnerOrRedirect = async (): Promise<LocalPartnerSession> => {
	const partner = await getCurrentLocalPartner();
	if (!partner) {
		redirect('/login');
	}
	return partner;
};
