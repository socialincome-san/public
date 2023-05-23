import i18next, { i18n } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import path from 'path';
import { LocaleLanguage } from '../types/admin/Language';

export const FALLBACK_LANGUAGE = LocaleLanguage.English;

interface TranslateProps {
	namespace?: string;
	language?: string;
	context?: object;
}

interface TranslatorProps {
	language: LocaleLanguage;
	namespaces: string[];
}

export class Translator {
	language: LocaleLanguage;
	namespaces: string[];
	instance: i18n;

	constructor(language: LocaleLanguage, namespaces: string[]) {
		this.language = language;
		this.namespaces = namespaces;
		this.instance = i18next.createInstance();
	}

	public static async getInstance({ language, namespaces }: TranslatorProps): Promise<Translator> {
		const translator = new Translator(language, namespaces);
		await translator.instance
			.use(
				resourcesToBackend(
					(language: string, namespace: string) =>
						import(path.join(__dirname, '..', '..', 'locales', language, `${namespace}.json`))
				)
			)
			.init({
				lng: language,
				ns: namespaces,
				fallbackLng: FALLBACK_LANGUAGE,
				interpolation: {
					escapeValue: false,
				},
			});
		return translator;
	}

	public t = (key: string, translateProps?: TranslateProps) => {
		return this.instance.t(key, {
			ns: translateProps?.namespace || this.namespaces,
			lng: translateProps?.language || this.language,
			...translateProps?.context,
		});
	};
}
