export type MarkdownFormat = 'bold' | 'italic' | 'bulletList' | 'link';

type TextEdit = {
	value: string;
	selectionStart: number;
	selectionEnd: number;
};

const LINK_URL_PLACEHOLDER = 'https://';

const wrap = ({ value, selectionStart, selectionEnd }: TextEdit, marker: string): TextEdit => {
	const selected = value.slice(selectionStart, selectionEnd);
	// Markers next to a space don't render as emphasis, and a double click often selects the trailing space.
	const start = selectionStart + selected.length - selected.trimStart().length;
	const end = Math.max(start, selectionEnd - (selected.length - selected.trimEnd().length));

	return {
		value: `${value.slice(0, start)}${marker}${value.slice(start, end)}${marker}${value.slice(end)}`,
		selectionStart: start + marker.length,
		selectionEnd: end + marker.length,
	};
};

const prefixLines = ({ value, selectionStart, selectionEnd }: TextEdit): TextEdit => {
	const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
	// A selection of whole lines ends after the newline, which must not pull in the next line.
	const lastSelected = selectionEnd > selectionStart && value[selectionEnd - 1] === '\n' ? selectionEnd - 1 : selectionEnd;
	const lineEnd = value.indexOf('\n', lastSelected);
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
			return wrap(edit, '*');
		case 'bulletList':
			return prefixLines(edit);
		case 'link':
			return link(edit);
	}
};
