'use client';

import {
	googleAnalyticsId,
	setAnalyticsConsent,
	useAnalyticsConsent,
	useConsentSettingsOpen,
} from '@/lib/analytics/analytics';
import { GoogleAnalytics } from '@next/third-parties/google';
import { CookieBanner } from '@socialincome/design-system/feedback/cookie-banner/cookie-banner';
import { useTranslations } from 'next-intl';
import NextLink from 'next/link';

export const CookieConsent = ({ privacyPolicyHref }: { privacyPolicyHref: string }) => {
	const t = useTranslations('website-common.cookie-consent');
	const consent = useAnalyticsConsent();
	const settingsOpen = useConsentSettingsOpen();

	if (!googleAnalyticsId) {
		return null;
	}

	return (
		<>
			{consent === 'granted' && <GoogleAnalytics gaId={googleAnalyticsId} />}
			{(consent === 'undecided' || settingsOpen) && (
				<CookieBanner
					title={t('title')}
					description={t.rich('description', {
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
