import { readPendingClaimIds } from '@/components/campaign/campaign-submission/pending-claim-ids';
import { sendSignInLink, type ClientAuth } from '@/lib/firebase/client-auth';
import { sendMagicLoginLinkAction } from '@/modules/auth/auth.actions';

// The server rejects continue URLs with malformed claim IDs, so stale local storage must not block the email.
const mergeClaimIds = (storedClaimIds: string[], claimId = ''): string[] =>
	[...new Set([...storedClaimIds, claimId.trim()])].filter((id) => /^[A-Za-z0-9]{8}$/.test(id));

export const buildMagicLoginContinueUrl = (
	origin: string,
	websiteBasePath: string,
	email: string,
	claimId?: string,
): string => {
	const url = new URL(`${websiteBasePath}/auth/confirm-login`, origin);
	url.searchParams.set('email', email);

	const claimIds = mergeClaimIds(readPendingClaimIds(), claimId);
	if (claimIds.length > 0) {
		url.searchParams.set('campaigns', claimIds.join(','));
	}

	return url.toString();
};

export const sendMagicLoginLink = async (input: {
	auth: ClientAuth;
	email: string;
	websiteBasePath: string;
	origin?: string;
	claimId?: string;
}): Promise<void> => {
	const origin = input.origin ?? (typeof window !== 'undefined' ? window.location.origin : undefined);
	if (!origin) {
		throw new Error('Missing sign-in request origin');
	}

	const continueUrl = buildMagicLoginContinueUrl(origin, input.websiteBasePath, input.email, input.claimId);
	const result = input.auth.emulatorConfig
		? await sendSignInLink(input.auth, input.email, continueUrl)
		: await sendMagicLoginLinkAction({ email: input.email, continueUrl });
	if (!result.success) {
		throw new Error(result.error);
	}
};
