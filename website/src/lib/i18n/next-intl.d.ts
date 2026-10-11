import { type Messages } from '@/lib/i18n/messages';
import { type WebsiteLanguage } from '@/lib/i18n/utils';

declare module 'next-intl' {
	interface AppConfig {
		Locale: WebsiteLanguage;
		Messages: Messages;
	}
}
