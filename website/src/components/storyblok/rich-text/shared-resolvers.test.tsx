import { resolveRichTextHref } from './shared-resolvers';

describe('resolveRichTextHref', () => {
	it('maps Storyblok story links to website paths', () => {
		expect(resolveRichTextHref('/pages/recipient-selection')).toBe('/recipient-selection');
		expect(resolveRichTextHref('/pages/persons/jane-doe')).toBe('/person/jane-doe');
		expect(resolveRichTextHref('pages/home')).toBe('/');
		expect(resolveRichTextHref('https://www.socialincome.org/pages/persons/jane-doe')).toBe(
			'https://www.socialincome.org/person/jane-doe',
		);
	});

	it('keeps other links untouched', () => {
		expect(resolveRichTextHref('/en/usd/programs')).toBe('/en/usd/programs');
		expect(resolveRichTextHref('mailto:hello@socialincome.org')).toBe('mailto:hello@socialincome.org');
	});
});
