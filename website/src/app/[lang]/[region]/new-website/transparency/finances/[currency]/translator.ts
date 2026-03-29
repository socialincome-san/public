import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { cache } from 'react';

export const getFinancesTranslator = cache((lang: string) =>
	Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-finances'],
	}),
);
