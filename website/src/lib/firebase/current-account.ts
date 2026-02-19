import { ContributorService } from '../services/contributor/contributor.service';
import { ContributorSession } from '../services/contributor/contributor.types';
import { FirebaseSessionService } from '../services/firebase/firebase-session.service';
import { LocalPartnerService } from '../services/local-partner/local-partner.service';
import { LocalPartnerSession } from '../services/local-partner/local-partner.types';
import { UserService } from '../services/user/user.service';
import { UserSession } from '../services/user/user.types';
import { getAuthenticatedContributorOrThrow } from './current-contributor';
import { getAuthenticatedLocalPartnerOrThrow } from './current-local-partner';
import { getAuthenticatedUserOrThrow } from './current-user';

export type Session = ContributorSession | LocalPartnerSession | UserSession;

export type Actor =
  | { kind: 'user'; session: UserSession }
  | { kind: 'contributor'; session: ContributorSession }
  | { kind: 'local-partner'; session: LocalPartnerSession }
  | never;

export const getCurrentSession = async (): Promise<Session | null> => {
  const firebaseSessionService = new FirebaseSessionService();
  const cookie = await firebaseSessionService.readSessionCookie();
  if (!cookie) {
    return null;
  }

  const decodedTokenResult = await firebaseSessionService.verifySessionCookie(cookie);
  if (!decodedTokenResult.success) {
    return null;
  }

  const authUserId = decodedTokenResult.data.uid;

  const contributorService = new ContributorService();
  const contributorResult = await contributorService.getCurrentContributorSession(authUserId);
  if (contributorResult.success && contributorResult.data) {
    return contributorResult.data;
  }

  const partnerService = new LocalPartnerService();
  const partnerResult = await partnerService.getCurrentLocalPartnerSession(authUserId);
  if (partnerResult.success && partnerResult.data) {
    return partnerResult.data;
  }

  const userService = new UserService();
  const userResult = await userService.getCurrentUserSession(authUserId);
  if (userResult.success && userResult.data) {
    return userResult.data;
  }

  return null;
};

export const getActorOrThrow = async (): Promise<Actor> => {
  const session = await getCurrentSession();

  switch (session?.type) {
    case 'user':
      return { kind: 'user', session: await getAuthenticatedUserOrThrow() };

    case 'contributor':
      return { kind: 'contributor', session: await getAuthenticatedContributorOrThrow() };

    case 'local-partner':
      return { kind: 'local-partner', session: await getAuthenticatedLocalPartnerOrThrow() };

    default:
      throw new Error('Not authenticated');
  }
};
