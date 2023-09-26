import { LanguageCode } from '@socialincome/shared/src/types/Language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { useState } from 'react';

export function useTranslator(language: LanguageCode, namespace: string) {
	const [translators, setTranslators] = useState<Map<string, Translator>>(new Map());

	if (!translators.has(namespace)) {
		Translator.getInstance({
			language,
			namespaces: [namespace],
		}).then((t) => setTranslators(new Map(translators.set(t.namespaces[0], t))));
	}

	return translators.get(namespace);
}
