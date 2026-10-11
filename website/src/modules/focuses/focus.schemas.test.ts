import { focusCreateInputSchema, focusUpdateInputSchema } from './focus.schemas';

describe('focus schemas', () => {
	test('trims valid focus input', () => {
		const result = focusCreateInputSchema.safeParse({
			name: ' Health ',
			slug: ' health ',
		});

		expect(result).toEqual({
			success: true,
			data: {
				name: 'Health',
				slug: 'health',
			},
		});
	});

	test('rejects invalid slugs and missing update ids', () => {
		expect(
			focusCreateInputSchema.safeParse({
				name: 'Health',
				slug: 'Health Focus',
			}).success,
		).toBe(false);
		expect(
			focusUpdateInputSchema.safeParse({
				name: 'Health',
				slug: 'health',
			}).success,
		).toBe(false);
	});
});
