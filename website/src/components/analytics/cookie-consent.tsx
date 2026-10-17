'use client';

import {
	getConsentModeSignals,
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
import Script from 'next/script';

export const CookieConsent = ({ privacyPolicyHref }: { privacyPolicyHref: string }) => {
	const t = useTranslations('website-common.cookie-consent');
	const consent = useAnalyticsConsent();
	const settingsOpen = useConsentSettingsOpen();

	if (!googleTagManagerId) {
		return null;
	}

	// Waits for the stored choice, which is unknown on the server, so the consent default matches it.
	const loadsTagManager = consent !== null && isGoogleTagGatewayHost();

	// During render, not in an effect: next/script requests Tag Manager from its own effect, which runs before ours.
	if (loadsTagManager) {
		registerFirstPartyGoogleTag();
	}

	return (
		<>
			{loadsTagManager && (
				<>
					{/* Must run before Tag Manager. gtag.js only reads commands pushed as an `arguments` object. Later
					choices are sent as consent updates by `setAnalyticsConsent`. */}
					<Script id="google-consent-mode">
						{`window.dataLayer = window.dataLayer || [];
window.gtag = function () { window.dataLayer.push(arguments); };
window.gtag('consent', 'default', ${JSON.stringify(getConsentModeSignals(consent === 'granted' ? 'granted' : 'denied'))});`}
					</Script>
					<GoogleTagManager gtmId={googleTagManagerId} gtmScriptUrl={googleTagGatewayUrl} />
				</>
			)}
			{(consent === 'undecided' || settingsOpen) && (
				<CookieBanner
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
