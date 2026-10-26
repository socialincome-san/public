'use client';

import {
	ensureConsentDefault,
	googleTagGatewayUrl,
	googleTagManagerId,
	isGoogleTagGatewayHost,
	registerFirstPartyGoogleTag,
	setAnalyticsConsent,
	useAnalyticsConsent,
	useConsentSettingsOpen,
} from '@/lib/analytics/analytics';
import { GoogleTagManager } from '@next/third-parties/google';
import { CookieBanner } from '@socialincome/design-system/feedback/cookie-banner/cookie-banner';
import { useTranslations } from 'next-intl';
import NextLink from 'next/link';
import { observeCookieBanner } from './cookie-banner-height';

export const CookieConsent = ({ privacyPolicyHref }: { privacyPolicyHref: string }) => {
	const t = useTranslations('website-common.cookie-consent');
	const consent = useAnalyticsConsent();
	const settingsOpen = useConsentSettingsOpen();

	if (!googleTagManagerId) {
		return null;
	}

	// Waits for the stored choice, which is unknown on the server.
	const loadsTagManager = consent !== null && isGoogleTagGatewayHost();

	// During render, not in an effect: next/script requests Tag Manager from its own effect, which runs before ours.
	if (loadsTagManager) {
		ensureConsentDefault();
		registerFirstPartyGoogleTag();
	}

	return (
		<>
			{loadsTagManager && <GoogleTagManager gtmId={googleTagManagerId} gtmScriptUrl={googleTagGatewayUrl} />}
			{(consent === 'undecided' || settingsOpen) && (
				<CookieBanner
					ref={observeCookieBanner}
					message={t.rich('message', {
						link: (chunks) => <NextLink href={privacyPolicyHref}>{chunks}</NextLink>,
					})}
					acceptLabel={t('accept')}
					declineLabel={t('decline')}
					onAccept={() => setAnalyticsConsent('granted')}
					onDecline={() => setAnalyticsConsent('denied')}
				/>
			)}
		</>
	);
};
