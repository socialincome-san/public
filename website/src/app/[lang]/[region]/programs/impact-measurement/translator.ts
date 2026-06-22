import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { cache } from 'react';

export const getImpactTranslator = cache((lang: string) =>
	Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-survey', 'countries'],
	}),
);
