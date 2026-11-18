import { applyMarkdownFormat } from './markdown-formatting';

describe('applyMarkdownFormat', () => {
	test('wraps the selection in bold markers and keeps it selected', () => {
		expect(applyMarkdownFormat({ value: 'say hello now', selectionStart: 4, selectionEnd: 9 }, 'bold')).toEqual({
			value: 'say **hello** now',
			selectionStart: 6,
			selectionEnd: 11,
		});
	});

	test('places the cursor between italic markers without a selection', () => {
		expect(applyMarkdownFormat({ value: 'ab', selectionStart: 1, selectionEnd: 1 }, 'italic')).toEqual({
			value: 'a__b',
			selectionStart: 2,
			selectionEnd: 2,
		});
	});

	test('turns every selected line into a list item', () => {
		const value = 'Intro\nfirst\nsecond\nOutro';

		expect(applyMarkdownFormat({ value, selectionStart: 8, selectionEnd: 15 }, 'bulletList')).toEqual({
			value: 'Intro\n- first\n- second\nOutro',
			selectionStart: 6,
			selectionEnd: 22,
		});
	});

	test('leaves lines that already are list items unchanged', () => {
		expect(applyMarkdownFormat({ value: '- one\ntwo', selectionStart: 0, selectionEnd: 9 }, 'bulletList').value).toBe(
			'- one\n- two',
		);
	});

	test('links the selection and selects the URL placeholder', () => {
		const result = applyMarkdownFormat({ value: 'see site', selectionStart: 4, selectionEnd: 8 }, 'link');

		expect(result.value).toBe('see [site](https://)');
		expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe('https://');
	});
});
