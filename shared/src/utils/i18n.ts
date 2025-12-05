import i18next, { i18n } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { LanguageCode } from '../types/language';

export const FALLBACK_LANGUAGE = 'en';

interface TranslateProps {
	namespace?: string;
	language?: string;
	context?: Record<string, unknown> & Partial<Intl.ResolvedNumberFormatOptions>;
}

interface TranslatorProps {
	language: LanguageCode;
	namespaces: string[] | string;
}

export type TranslateFunction = <T = string>(key: string, translateProps?: TranslateProps) => T;

export class Translator {
	language: LanguageCode;
	namespaces: string[] | string;
	instance: i18n;

	constructor(language: LanguageCode, namespaces: string[] | string) {
		this.language = language;
		this.namespaces = namespaces;
		this.instance = i18next.createInstance();
	}

	public static async getInstance({ language, namespaces }: TranslatorProps): Promise<Translator> {
		const translator = new Translator(language, namespaces);

		await translator.instance
			.use(
				resourcesToBackend((lng: string, ns: string) => {
					return import(`@socialincome/shared/locales/${lng}/${ns}.json`);
				}),
			)
			.init({
				lng: language,
				ns: namespaces,
				fallbackLng: FALLBACK_LANGUAGE,
				returnObjects: true,
				interpolation: {
					escapeValue: false,
				},
			});

		return translator;
	}

	public t: TranslateFunction = <T = string>(key: string, translateProps?: TranslateProps) => {
		return this.instance.t(key, {
			ns: translateProps?.namespace || this.namespaces,
			lng: translateProps?.language || this.language,
			...translateProps?.context,
		}) as T;
	};
}
