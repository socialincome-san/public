import { loadMessages } from '@/lib/i18n/messages';
import { defaultLanguage, isWebsiteLanguage } from '@/lib/i18n/utils';
import { getRequestConfig } from 'next-intl/server';

export const TIME_ZONE = 'Europe/Zurich';

// The locale is always passed explicitly (`getTranslations({ locale })`) instead of being read from the
// request, so translated server code stays cacheable. Without one, e.g. in the English-only portal, it is English.
export default getRequestConfig(async ({ locale }) => {
	const language = isWebsiteLanguage(locale) ? locale : defaultLanguage;

	return { locale: language, messages: await loadMessages(language), timeZone: TIME_ZONE };
});
