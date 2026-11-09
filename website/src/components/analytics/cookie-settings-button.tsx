'use client';

import { asksForConsent, openConsentSettings } from '@/lib/analytics/analytics';
import { SiteFooterButton } from '@socialincome/design-system/navigation/site-footer/site-footer';
import { useTranslations } from 'next-intl';

export const CookieSettingsButton = () => {
	const t = useTranslations('website-common.cookie-consent');

	return asksForConsent ? <SiteFooterButton onClick={openConsentSettings}>{t('settings')}</SiteFooterButton> : null;
};
