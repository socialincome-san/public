// Matches `name="value"`, `name='value'` and `name=value` inside the first <iframe> tag.
const ATTRIBUTE_PATTERN = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

const NAMED_ENTITIES = new Map([
	['amp', '&'],
	['lt', '<'],
	['gt', '>'],
	['quot', '"'],
	['apos', "'"],
]);

// One pass, so `&amp;gt;` stays the literal text `&gt;`. Numeric forms matter too: `&#38;` read as `&#` would start a
// fragment and drop the query parameters after it.
const decodeEntities = (value: string) =>
	value.replace(
		/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi,
		(entity: string, decimal: string | undefined, hex: string | undefined, name: string | undefined) => {
			if (name) {
				return NAMED_ENTITIES.get(name.toLowerCase()) ?? entity;
			}
			const codePoint = decimal ? Number(decimal) : parseInt(hex ?? '', 16);

			return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
		},
	);

const readIframeAttributes = (code: string) => {
	// Skips `>` inside quoted values, which URLs may contain.
	const tag = code.match(/<iframe\b(?:[^>"']|"[^"]*"|'[^']*')*>/i)?.[0] ?? '';

	return new Map(
		[...tag.matchAll(ATTRIBUTE_PATTERN)].map(([, name, ...values]) => [
			name.toLowerCase(),
			decodeEntities(values.find((value) => value !== undefined) ?? ''),
		]),
	);
};

/**
 * Reads the URL, title and pixel height from pasted <iframe> code, or takes the text as a URL. The code itself is never
 * rendered, so pasted scripts or event handlers have no effect. Returns null unless the URL is https.
 */
export const parseEmbedCode = (code: string | undefined) => {
	const trimmed = code?.trim() ?? '';
	const attributes = trimmed.startsWith('<') ? readIframeAttributes(trimmed) : new Map([['src', trimmed]]);
	const src = attributes.get('src') ?? '';

	if (!URL.canParse(src) || new URL(src).protocol !== 'https:') {
		return null;
	}

	const height = attributes.get('height')?.match(/^(\d+)(px)?$/)?.[1];

	const url = new URL(src);

	return {
		src: url.href,
		title: attributes.get('title')?.trim() ?? '',
		hostname: url.hostname,
		height: height ? Number(height) : undefined,
	};
};
