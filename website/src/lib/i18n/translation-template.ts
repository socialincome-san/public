export type TranslationTemplatePart = { type: 'text'; value: string } | { type: 'placeholder'; key: string };

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

export const splitTranslationTemplate = (template: string): TranslationTemplatePart[] => {
	const parts: TranslationTemplatePart[] = [];
	let lastIndex = 0;

	for (const match of template.matchAll(PLACEHOLDER_REGEX)) {
		const matchIndex = match.index ?? 0;
		if (matchIndex > lastIndex) {
			parts.push({ type: 'text', value: template.slice(lastIndex, matchIndex) });
		}

		const key = match[1];
		if (key) {
			parts.push({ type: 'placeholder', key });
		}
		lastIndex = matchIndex + match[0].length;
	}

	if (lastIndex < template.length) {
		parts.push({ type: 'text', value: template.slice(lastIndex) });
	}

	return parts;
};
