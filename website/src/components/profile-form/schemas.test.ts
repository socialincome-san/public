import { createProfileFormSchema } from './schemas';

describe('profile form validation messages', () => {
	test('uses the current language for required and invalid email errors', () => {
		const schema = createProfileFormSchema({
			required: 'Required in the selected language.',
			invalidEmail: 'Invalid email in the selected language.',
		});
		const result = schema.safeParse({
			type: 'user',
			firstName: '',
			lastName: '',
			email: 'not-an-email',
			address: {
				country: null,
				street: '',
				number: '',
				city: '',
				zip: '',
			},
		});

		expect(result.success).toBe(false);
		if (result.success) {
			throw new Error('Expected profile validation to fail');
		}

		const messages = result.error.issues.map((issue) => issue.message);
		expect(messages.filter((message) => message === 'Required in the selected language.')).toHaveLength(3);
		expect(messages).toContain('Invalid email in the selected language.');
	});
});
