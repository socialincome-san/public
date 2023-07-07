import fs from 'fs';
import Handlebars from 'handlebars';
// @ts-ignore
import registerI18nHelper from 'handlebars-i18next';
import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import mjml2html from 'mjml';
import path from 'path';
import { LocaleLanguage } from '../types';
import { FALLBACK_LANGUAGE } from './i18n';

export interface RenderTemplateProps {
	language?: LocaleLanguage;
	translationNamespace?: string | string[];
	hbsTemplatePath: string; // path starting from /shared/templates/{hbsTemplatePath}
	context: object;
}

const readHbs = (filePath: string) => {
	return fs.readFileSync(path.join(__dirname, '..', '..', 'templates', filePath), 'utf-8');
};

const partials = [
	{
		name: 'layout',
		path: 'email/partials/layout.hbs',
	},
];
partials.forEach((partial) => Handlebars.registerPartial(partial.name, readHbs(partial.path)));

export const renderTemplate = async ({
	language,
	translationNamespace = [],
	hbsTemplatePath,
	context,
}: RenderTemplateProps) => {
	const i18n = i18next.createInstance();
	await i18n
		.use(
			resourcesToBackend(
				(language: string, namespace: string) => import(`../../locales/${language}/${namespace}.json`),
			),
		)
		.init({
			lng: language,
			ns: translationNamespace,
			fallbackLng: FALLBACK_LANGUAGE,
			interpolation: {
				escapeValue: false,
			},
		});
	registerI18nHelper(Handlebars, i18n);

	return Handlebars.compile(readHbs(hbsTemplatePath))(context);
};

export const renderEmailTemplate = async (props: RenderTemplateProps) => {
	return mjml2html(await renderTemplate(props)).html;
};
