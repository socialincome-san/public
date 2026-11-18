export type MarkdownFormat = 'bold' | 'italic' | 'bulletList' | 'link';

type TextEdit = {
	value: string;
	selectionStart: number;
	selectionEnd: number;
};

const LINK_URL_PLACEHOLDER = 'https://';

// Markers next to a space don't render as emphasis, and a double click often selects the trailing space.
const wrapTrimmed = (text: string, marker: string) => {
	const leading = text.length - text.trimStart().length;
	const trailing = text.length - text.trimEnd().length;

	return `${text.slice(0, leading)}${marker}${text.trim()}${marker}${text.slice(text.length - trailing)}`;
};

const PARAGRAPH_BREAK = /(\n[^\S\n]*\n\s*)/;

const wrap = ({ value, selectionStart, selectionEnd }: TextEdit, marker: string): TextEdit => {
	const selected = value.slice(selectionStart, selectionEnd);

	// Emphasis cannot span paragraphs, so each one gets its own markers.
	if (PARAGRAPH_BREAK.test(selected.trim())) {
		const wrapped = selected
			.split(PARAGRAPH_BREAK)
			.map((part, index) => (index % 2 === 1 || !part.trim() ? part : wrapTrimmed(part, marker)))
			.join('');

		return {
			value: `${value.slice(0, selectionStart)}${wrapped}${value.slice(selectionEnd)}`,
			selectionStart,
			selectionEnd: selectionStart + wrapped.length,
		};
	}

	const start = selectionStart + selected.length - selected.trimStart().length;
	const end = Math.max(start, selectionEnd - (selected.length - selected.trimEnd().length));

	return {
		value: `${value.slice(0, start)}${marker}${value.slice(start, end)}${marker}${value.slice(end)}`,
		selectionStart: start + marker.length,
		selectionEnd: end + marker.length,
	};
};

const prefixLines = ({ value, selectionStart, selectionEnd }: TextEdit): TextEdit => {
	// lastIndexOf treats -1 like 0, which would find a newline at the very start.
	const lineStart = selectionStart === 0 ? 0 : value.lastIndexOf('\n', selectionStart - 1) + 1;
	// A selection of whole lines ends after the newline, which must not pull in the next line.
	const lastSelected = selectionEnd > selectionStart && value[selectionEnd - 1] === '\n' ? selectionEnd - 1 : selectionEnd;
	const lineEnd = value.indexOf('\n', lastSelected);
	const end = lineEnd === -1 ? value.length : lineEnd;
	const lines = value.slice(lineStart, end).split('\n');
	const prefixed = lines.map((line) => (/^[-*+] /.test(line) ? line : `- ${line}`)).join('\n');

	return {
		value: `${value.slice(0, lineStart)}${prefixed}${value.slice(end)}`,
		selectionStart: lineStart,
		selectionEnd: lineStart + prefixed.length,
	};
};

const link = ({ value, selectionStart, selectionEnd }: TextEdit, placeholderText: string): TextEdit => {
	const selected = value.slice(selectionStart, selectionEnd) || placeholderText;
	const before = `${value.slice(0, selectionStart)}[${selected}](`;

	// The URL is selected, so typing replaces the placeholder.
	return {
		value: `${before}${LINK_URL_PLACEHOLDER})${value.slice(selectionEnd)}`,
		selectionStart: before.length,
		selectionEnd: before.length + LINK_URL_PLACEHOLDER.length,
	};
};

// linkText labels a link inserted without a selection, so it is never empty.
export const applyMarkdownFormat = (edit: TextEdit, format: MarkdownFormat, linkText: string): TextEdit => {
	switch (format) {
		case 'bold':
			return wrap(edit, '**');
		case 'italic':
			return wrap(edit, '*');
		case 'bulletList':
			return prefixLines(edit);
		case 'link':
			return link(edit, linkText);
	}
};
