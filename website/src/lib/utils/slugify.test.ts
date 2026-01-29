import { slugify } from './slugify';

const SLUGIFY_TEST_CASES = [
	{ input: 'Hello World!', expected: 'hello-world' },
	{ input: '  Leading and trailing spaces  ', expected: 'leading-and-trailing-spaces' },
	{ input: 'Special #$&* Characters', expected: 'special-characters' },
	{ input: 'Multiple    Spaces', expected: 'multiple-spaces' },
	{ input: 'Accented éüçô Characters', expected: 'accented-characters' },
	{ input: 'Mixed CASE Input', expected: 'mixed-case-input' },
	{ input: '123 Numbers 456', expected: '123-numbers-456' },
	{ input: '---Dashes---and___underscores___', expected: 'dashes-and-underscores' },
	{ input: 'Emoji 😊 Test 🚀', expected: 'emoji-test' },
];

describe('Slugify', () => {
	SLUGIFY_TEST_CASES.forEach(({ input, expected }) => {
		test(`Slugifies "${input}" to "${expected}"`, () => {
			const result = slugify(input);
			expect(result).toBe(expected);
		});
	});
});
