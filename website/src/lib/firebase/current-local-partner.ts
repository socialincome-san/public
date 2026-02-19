import { FirebaseSessionService } from '@/lib/services/firebase/firebase-session.service';
import { LocalPartnerService } from '@/lib/services/local-partner/local-partner.service';
import { LocalPartnerSession } from '@/lib/services/local-partner/local-partner.types';
import { redirect } from 'next/navigation';
import { cache } from 'react';

const firebaseSessionService = new FirebaseSessionService();
const service = new LocalPartnerService();

const findLocalPartnerByAuthId = async (authUserId: string): Promise<LocalPartnerSession | null> => {
  const result = await service.getCurrentLocalPartnerSession(authUserId);

  return result.success ? result.data : null;
};

const loadCurrentLocalPartner = async (): Promise<LocalPartnerSession | null> => {
  const cookie = await firebaseSessionService.readSessionCookie();
  if (!cookie) {
    return null;
  }

  const decodedTokenResult = await firebaseSessionService.verifySessionCookie(cookie);
  if (!decodedTokenResult.success) {
    return null;
  }

  const authUserId = decodedTokenResult.data.uid;

  return findLocalPartnerByAuthId(authUserId);
};

const getCurrentLocalPartner = cache(loadCurrentLocalPartner);

export const getAuthenticatedLocalPartnerOrRedirect = async (): Promise<LocalPartnerSession> => {
  const partner = await getCurrentLocalPartner();
  if (!partner) {
    redirect('/login');
  }

  return partner;
};

export const getAuthenticatedLocalPartnerOrThrow = async (): Promise<LocalPartnerSession> => {
  const partner = await getCurrentLocalPartner();
  if (!partner) {
    throw new Error('No authenticated local partner found');
  }

  return partner;
};
