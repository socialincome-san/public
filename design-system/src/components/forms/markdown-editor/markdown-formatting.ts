export type MarkdownFormat = 'bold' | 'italic' | 'bulletList' | 'link';

type TextEdit = {
	value: string;
	selectionStart: number;
	selectionEnd: number;
};

const LINK_URL_PLACEHOLDER = 'https://';

const wrap = ({ value, selectionStart, selectionEnd }: TextEdit, marker: string): TextEdit => {
	const selected = value.slice(selectionStart, selectionEnd);

	return {
		value: `${value.slice(0, selectionStart)}${marker}${selected}${marker}${value.slice(selectionEnd)}`,
		selectionStart: selectionStart + marker.length,
		selectionEnd: selectionEnd + marker.length,
	};
};

const prefixLines = ({ value, selectionStart, selectionEnd }: TextEdit): TextEdit => {
	const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
	const lineEnd = value.indexOf('\n', selectionEnd);
	const end = lineEnd === -1 ? value.length : lineEnd;
	const lines = value.slice(lineStart, end).split('\n');
	const prefixed = lines.map((line) => (line.startsWith('- ') ? line : `- ${line}`)).join('\n');

	return {
		value: `${value.slice(0, lineStart)}${prefixed}${value.slice(end)}`,
		selectionStart: lineStart,
		selectionEnd: lineStart + prefixed.length,
	};
};

const link = ({ value, selectionStart, selectionEnd }: TextEdit): TextEdit => {
	const selected = value.slice(selectionStart, selectionEnd);
	const before = `${value.slice(0, selectionStart)}[${selected}](`;

	// The URL is selected, so typing replaces the placeholder.
	return {
		value: `${before}${LINK_URL_PLACEHOLDER})${value.slice(selectionEnd)}`,
		selectionStart: before.length,
		selectionEnd: before.length + LINK_URL_PLACEHOLDER.length,
	};
};

export const applyMarkdownFormat = (edit: TextEdit, format: MarkdownFormat): TextEdit => {
	switch (format) {
		case 'bold':
			return wrap(edit, '**');
		case 'italic':
			return wrap(edit, '_');
		case 'bulletList':
			return prefixLines(edit);
		case 'link':
			return link(edit);
	}
};
