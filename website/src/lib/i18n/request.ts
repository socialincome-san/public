import { loadMessages } from '@/lib/i18n/messages';
import { defaultLanguage, isWebsiteLanguage, TIME_ZONE } from '@/lib/i18n/utils';
import { getRequestConfig } from 'next-intl/server';
import { lang } from 'next/root-params';

// Root params throw in Route Handlers and Server Actions, so translate there with an explicit locale
// (`getTranslations({ locale })`). Routes outside `[lang]`, like the portal, are English.
export default getRequestConfig(async ({ locale }) => {
	const requested = locale ?? (await lang());
	const language = isWebsiteLanguage(requested) ? requested : defaultLanguage;

	return { locale: language, messages: await loadMessages(language), timeZone: TIME_ZONE };
});
