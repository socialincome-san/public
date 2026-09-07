import { splitTranslationTemplate } from './translation-template';

describe('splitTranslationTemplate', () => {
	test('keeps placeholders so translations can change word order', () => {
		expect(splitTranslationTemplate('{{amount}} donations arrived from {{countriesCount}} countries')).toEqual([
			{ type: 'placeholder', key: 'amount' },
			{ type: 'text', value: ' donations arrived from ' },
			{ type: 'placeholder', key: 'countriesCount' },
			{ type: 'text', value: ' countries' },
		]);
		expect(splitTranslationTemplate('{{countriesCount}} Länder spendeten {{amount}}')).toEqual([
			{ type: 'placeholder', key: 'countriesCount' },
			{ type: 'text', value: ' Länder spendeten ' },
			{ type: 'placeholder', key: 'amount' },
		]);
	});
});
