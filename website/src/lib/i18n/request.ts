import { loadMessages } from '@/lib/i18n/messages';
import {
	defaultLanguage,
	getPortalLanguage,
	isWebsiteLanguage,
	PORTAL_LANGUAGE_COOKIE_NAME,
	PORTAL_ROUTE_HEADER,
	TIME_ZONE,
} from '@/lib/i18n/utils';
import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { lang } from 'next/root-params';

// Root params throw in Route Handlers and Server Actions, so translate there with an explicit locale
// (`getTranslations({ locale })`). Portal requests use the signed-in user's saved language preference.
export default getRequestConfig(async ({ locale }) => {
	const requested = locale ?? (await lang());
	const isPortalRequest = (await headers()).get(PORTAL_ROUTE_HEADER) === 'true';
	const portalLanguage = isPortalRequest ? (await cookies()).get(PORTAL_LANGUAGE_COOKIE_NAME)?.value : undefined;
	const language = isPortalRequest
		? getPortalLanguage(portalLanguage)
		: isWebsiteLanguage(requested)
			? requested
			: defaultLanguage;

	return { locale: language, messages: await loadMessages(language), timeZone: TIME_ZONE };
});
