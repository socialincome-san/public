'use client';

import { googleAnalyticsId, openConsentSettings } from '@/lib/analytics/analytics';
import { SiteFooterButton } from '@socialincome/design-system/navigation/site-footer/site-footer';
import { useTranslations } from 'next-intl';

export const CookieSettingsButton = () => {
	const t = useTranslations('website-common.cookie-consent');

	return googleAnalyticsId ? <SiteFooterButton onClick={openConsentSettings}>{t('settings')}</SiteFooterButton> : null;
};
