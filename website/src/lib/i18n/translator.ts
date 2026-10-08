import { LanguageCode } from '@/lib/types/language';
import i18next, { i18n } from 'i18next';
import ICU from 'i18next-icu';
import resourcesToBackend from 'i18next-resources-to-backend';

const FALLBACK_LANGUAGE = 'en';

type TranslateProps = {
	namespace?: string;
	language?: string;
	context?: Record<string, unknown> & Partial<Intl.ResolvedNumberFormatOptions>;
};

type TranslatorProps = {
	language: LanguageCode;
	namespaces: string[] | string;
};

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
					return import(`@/lib/i18n/locales/${lng}/${ns}.json`);
				}),
			)
			.use(ICU)
			.init({
				lng: language,
				ns: namespaces,
				fallbackLng: FALLBACK_LANGUAGE,
				returnObjects: true,
				interpolation: {
					escapeValue: false,
				},
				i18nFormat: {
					parseErrorHandler: (error: Error, key: string, message: string) => {
						console.error(`Failed to format translation "${key}"`, error);

						return message;
					},
				},
			});

		return translator;
	}

	public t: TranslateFunction = <T = string>(key: string, translateProps?: TranslateProps) => {
		return this.instance.t(key, {
			ns: translateProps?.namespace ?? this.namespaces,
			lng: translateProps?.language ?? this.language,
			...translateProps?.context,
		}) as T;
	};

	// Unformatted ICU message, for templates whose placeholders are filled in later, e.g. on the client.
	public raw = <T = string>(key: string): T => {
		const namespaces = Array.isArray(this.namespaces) ? this.namespaces : [this.namespaces];
		for (const language of [this.language, FALLBACK_LANGUAGE]) {
			for (const namespace of namespaces) {
				const message: unknown = this.instance.getResource(language, namespace, key);
				if (message !== undefined) {
					return message as T;
				}
			}
		}

		return key as T;
	};
}
