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
// (`getTranslations({ locale })`). The portal has no `[lang]` segment and uses the signed-in user's
// language, which login and the profile form store in a cookie.
const getRequestLanguage = async () => {
	if ((await headers()).get(PORTAL_ROUTE_HEADER) === 'true') {
		return getPortalLanguage((await cookies()).get(PORTAL_LANGUAGE_COOKIE_NAME)?.value);
	}
	const requested = await lang();

	return isWebsiteLanguage(requested) ? requested : defaultLanguage;
};

export default getRequestConfig(async ({ locale }) => {
	const language = locale && isWebsiteLanguage(locale) ? locale : await getRequestLanguage();

	return { locale: language, messages: await loadMessages(language), timeZone: TIME_ZONE };
});
