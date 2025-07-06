import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { useEffect, useState } from 'react';

export function useTranslator(language: LanguageCode, namespace: string) {
	const [translators, setTranslators] = useState<Map<string, Translator>>(new Map());

	useEffect(() => {
		if (!translators.has(namespace)) {
			Translator.getInstance({
				language,
				namespaces: [namespace],
			}).then((t) => setTranslators((prev) => new Map(prev.set(t.namespaces[0], t))));
		}
	}, [language, namespace, translators]);

	return translators.get(namespace);
}
