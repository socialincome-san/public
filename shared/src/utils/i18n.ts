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

export type TranslateFunction = <T = string>(
	key: string,
	translateProps?: {
		context: {
			contributorCount: number;
			value: number;
			currency: string;
			maximumFractionDigits: number;
			style: string;
			locale: string;
		};
	},
) => T;

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
				resourcesToBackend((language: string, namespace: string) => {
					try {
						// for translations to work in the functions runtime, we need to import the local translation files
						const fs = require('fs');
						const path = require('path');
						const localPath = path.join(__dirname, `../../locales/${language}/${namespace}.json`);
						if (fs.existsSync(localPath)) return import(localPath);
					} catch (e) {} // do nothing if module not found
					return import(`@socialincome/shared/locales/${language}/${namespace}.json`);
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

	public t: <T = string>(key: string, translateProps?: TranslateProps) => T = <T = string>(
		key: string,
		translateProps?: TranslateProps,
	): T => {
		return this.instance.t(key, {
			ns: translateProps?.namespace || this.namespaces,
			lng: translateProps?.language || this.language,
			...translateProps?.context,
		}) as T;
	};
}
