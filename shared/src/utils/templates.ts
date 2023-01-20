import fs from 'fs';
import Handlebars from 'handlebars';
// @ts-ignore
import registerI18nHelper from 'handlebars-i18next';
import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import mjml2html from 'mjml';
import path from 'path';

interface RenderTemplateProps {
	language: string;
	namespace: string;
	context: object;
}

export const renderTemplate = async ({ language, namespace, context }: RenderTemplateProps) => {
	const i18n = i18next.createInstance();
	await i18n
		.use(
			resourcesToBackend((language: string, namespace: string) => import(`../../locales/${language}/${namespace}.json`))
		)
		.init({
			lng: language,
			ns: namespace,
		});
	registerI18nHelper(Handlebars, i18n);
	return Handlebars.compile(
		fs.readFileSync(path.join(__dirname, '..', '..', `/templates/email/${namespace}.handlebars`), 'utf-8')
	)(context);
};

export const renderEmailTemplate = async (props: RenderTemplateProps) => {
	return mjml2html(await renderTemplate(props)).html;
};
