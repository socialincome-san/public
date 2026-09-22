import { getCurrentLocalPartnerSession } from '@/modules/local-partners/local-partner.service';
import type { LocalPartnerSession } from '@/modules/local-partners/local-partner.types';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getCurrentAuthToken } from './session-cookie';

const loadCurrentLocalPartner = async (): Promise<LocalPartnerSession | null> => {
	const decodedTokenResult = await getCurrentAuthToken();
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	const result = await getCurrentLocalPartnerSession(authUserId);

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
