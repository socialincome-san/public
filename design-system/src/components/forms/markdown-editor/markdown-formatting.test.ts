import { applyMarkdownFormat } from './markdown-formatting';

describe('applyMarkdownFormat', () => {
	test('wraps the selection in bold markers and keeps it selected', () => {
		expect(applyMarkdownFormat({ value: 'say hello now', selectionStart: 4, selectionEnd: 9 }, 'bold', 'Link')).toEqual({
			value: 'say **hello** now',
			selectionStart: 6,
			selectionEnd: 11,
		});
	});

	test('places the cursor between italic markers without a selection', () => {
		expect(applyMarkdownFormat({ value: 'ab', selectionStart: 1, selectionEnd: 1 }, 'italic', 'Link')).toEqual({
			value: 'a**b',
			selectionStart: 2,
			selectionEnd: 2,
		});
	});

	test('keeps spaces around the selection outside the markers', () => {
		expect(applyMarkdownFormat({ value: 'say hello now', selectionStart: 4, selectionEnd: 10 }, 'bold', 'Link')).toEqual({
			value: 'say **hello** now',
			selectionStart: 6,
			selectionEnd: 11,
		});
	});

	test('stops at the last selected line when the selection ends after a newline', () => {
		expect(applyMarkdownFormat({ value: 'one\ntwo', selectionStart: 0, selectionEnd: 4 }, 'bulletList', 'Link').value).toBe(
			'- one\ntwo',
		);
	});

	test('turns every selected line into a list item', () => {
		const value = 'Intro\nfirst\nsecond\nOutro';

		expect(applyMarkdownFormat({ value, selectionStart: 8, selectionEnd: 15 }, 'bulletList', 'Link')).toEqual({
			value: 'Intro\n- first\n- second\nOutro',
			selectionStart: 6,
			selectionEnd: 22,
		});
	});

	test('leaves lines that already are list items unchanged', () => {
		expect(
			applyMarkdownFormat({ value: '- one\ntwo', selectionStart: 0, selectionEnd: 9 }, 'bulletList', 'Link').value,
		).toBe('- one\n- two');
	});

	test('wraps each selected paragraph on its own', () => {
		expect(applyMarkdownFormat({ value: 'Food\n\nRent', selectionStart: 0, selectionEnd: 10 }, 'bold', 'Link').value).toBe(
			'**Food**\n\n**Rent**',
		);
	});

	test('starts the list on the first line when the text begins with a newline', () => {
		expect(applyMarkdownFormat({ value: '\nNext', selectionStart: 0, selectionEnd: 0 }, 'bulletList', 'Link').value).toBe(
			'- \nNext',
		);
	});

	test('keeps lines that use other bullet markers', () => {
		expect(
			applyMarkdownFormat({ value: '* Food\n+ Rent', selectionStart: 0, selectionEnd: 13 }, 'bulletList', 'Link').value,
		).toBe('* Food\n+ Rent');
	});

	test('inserts link text when nothing is selected', () => {
		expect(applyMarkdownFormat({ value: '', selectionStart: 0, selectionEnd: 0 }, 'link', 'Link').value).toBe(
			'[Link](https://)',
		);
	});

	test('links the selection and selects the URL placeholder', () => {
		const result = applyMarkdownFormat({ value: 'see site', selectionStart: 4, selectionEnd: 8 }, 'link', 'Link');

		expect(result.value).toBe('see [site](https://)');
		expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe('https://');
	});
});
