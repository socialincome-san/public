import { readTurnstileToken } from './campaign.schemas';

describe('readTurnstileToken', () => {
	test('returns a trimmed token from form data', () => {
		const formData = new FormData();
		formData.set('cf-turnstile-response', '  token-value  ');

		expect(readTurnstileToken(formData)).toBe('token-value');
	});

	test('returns null when the field is missing or blank', () => {
		expect(readTurnstileToken(new FormData())).toBeNull();

		const formData = new FormData();
		formData.set('cf-turnstile-response', '   ');
		expect(readTurnstileToken(formData)).toBeNull();
	});
});
