'use client';

import { LanguageCode } from '@/lib/types/language';
import { useParams } from 'next/navigation';
import { useTranslator } from './useTranslator';

type TranslateContext = Record<string, unknown>;

type Props = {
	namespace: string;
	fallbackLanguage?: LanguageCode;
};

export const useRouteTranslator = ({ namespace, fallbackLanguage = 'en' }: Props) => {
	const params = useParams();
	const langParam = params?.lang;
	const language = (typeof langParam === 'string' ? langParam : fallbackLanguage) as LanguageCode;
	const translator = useTranslator(language, namespace);

	const t = (key: string, context?: TranslateContext): string => {
		if (!translator) {
			return key;
		}

		return translator.t<string>(key, { context });
	};

	return { t, translator, language };
};
