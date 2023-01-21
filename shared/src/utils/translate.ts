import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

interface TranslateProps {
	language: string;
	namespace: string;
	key: string;
	context?: object;
}

export const translate = async ({ language, namespace, key, context }: TranslateProps) => {
	const i18n = i18next.createInstance();
	await i18n
		.use(
			resourcesToBackend((language: string, namespace: string) => import(`../../locales/${language}/${namespace}.json`))
		)
		.init({
			lng: language,
			ns: namespace,
		});
	return i18n.t(key, { ...context });
};
