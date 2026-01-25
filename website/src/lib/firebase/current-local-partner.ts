import { FirebaseService } from '@/lib/services/firebase/firebase.service';
import { LocalPartnerService } from '@/lib/services/local-partner/local-partner.service';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { redirect } from 'next/navigation';
import { cache } from 'react';

const firebaseService = new FirebaseService();
const service = new LocalPartnerService();

async function findLocalPartnerByAuthId(authUserId: string): Promise<LocalPartnerSession | null> {
	const result = await service.getCurrentLocalPartnerSession(authUserId);
	return result.success ? result.data : null;
}

async function loadCurrentLocalPartner(): Promise<LocalPartnerSession | null> {
	const cookie = await firebaseService.readSessionCookie();
	if (!cookie) {
		return null;
	}

	const decodedTokenResult = await firebaseService.verifySessionCookie(cookie);
	if (!decodedTokenResult.success) {
		return null;
	}

	const authUserId = decodedTokenResult.data.uid;
	return findLocalPartnerByAuthId(authUserId);
}

const getCurrentLocalPartner = cache(loadCurrentLocalPartner);

export async function getAuthenticatedLocalPartnerOrRedirect(): Promise<LocalPartnerSession> {
	const partner = await getCurrentLocalPartner();
	if (!partner) {
		redirect('/login');
	}
	return partner;
}

export async function getAuthenticatedLocalPartnerOrThrow(): Promise<LocalPartnerSession> {
	const partner = await getCurrentLocalPartner();
	if (!partner) {
		throw new Error('No authenticated local partner found');
	}
	return partner;
}
