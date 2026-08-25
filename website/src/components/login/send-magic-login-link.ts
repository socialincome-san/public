import { readPendingClaimIds } from '@/components/campaign/campaign-submission/pending-claim-ids';
import { type Auth, sendSignInLinkToEmail } from 'firebase/auth';

export const buildMagicLoginContinueUrl = (origin: string, email: string): string => {
	const url = new URL('/auth/confirm-login', origin);
	url.searchParams.set('email', email);

	const claimIds = readPendingClaimIds();
	if (claimIds.length > 0) {
		url.searchParams.set('campaigns', claimIds.join(','));
	}

	return url.toString();
};

export const sendMagicLoginLink = async (input: { auth: Auth; email: string; origin?: string }): Promise<void> => {
	const origin = input.origin ?? (typeof window !== 'undefined' ? window.location.origin : undefined);
	if (!origin) {
		return;
	}

	await sendSignInLinkToEmail(input.auth, input.email, {
		url: buildMagicLoginContinueUrl(origin, input.email),
		handleCodeInApp: true,
	});
};
