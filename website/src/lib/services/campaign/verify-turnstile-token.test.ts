import { readTurnstileToken, turnstileSiteverifyUrl, verifyTurnstileToken } from './verify-turnstile-token';

const originalFetch = global.fetch;
const originalSecret = process.env.TURNSTILE_SECRET_KEY;
const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const jsonResponse = (body: unknown, status = 200) => ({
	ok: status >= 200 && status < 300,
	status,
	json: () => Promise.resolve(body),
});

describe('verifyTurnstileToken', () => {
	let fetchMock: jest.Mock;

	beforeEach(() => {
		process.env.TURNSTILE_SECRET_KEY = 'test-secret';
		delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
		fetchMock = jest.fn();
		global.fetch = fetchMock as typeof fetch;
	});

	afterEach(() => {
		global.fetch = originalFetch;
		if (originalSecret === undefined) {
			delete process.env.TURNSTILE_SECRET_KEY;
		} else {
			process.env.TURNSTILE_SECRET_KEY = originalSecret;
		}

		if (originalSiteKey === undefined) {
			delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
		} else {
			process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey;
		}

		jest.restoreAllMocks();
	});

	test('fails the challenge when the secret is missing', async () => {
		delete process.env.TURNSTILE_SECRET_KEY;

		await expect(verifyTurnstileToken('token')).resolves.toEqual({
			success: false,
			error: 'turnstile-invalid',
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	test('fails the challenge when the secret is blank', async () => {
		process.env.TURNSTILE_SECRET_KEY = '   ';

		await expect(verifyTurnstileToken('token')).resolves.toEqual({
			success: false,
			error: 'turnstile-invalid',
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	test('requires a token when the secret is configured', async () => {
		await expect(verifyTurnstileToken(null)).resolves.toEqual({
			success: false,
			error: 'turnstile-required',
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	test('accepts a token that Cloudflare marks as valid', async () => {
		let capturedBody: URLSearchParams | undefined;
		fetchMock.mockImplementation((_url: RequestInfo | URL, init?: RequestInit) => {
			capturedBody = init?.body instanceof URLSearchParams ? init.body : undefined;

			return jsonResponse({ success: true });
		});

		await expect(verifyTurnstileToken('valid-token')).resolves.toEqual({ success: true });
		expect(fetchMock).toHaveBeenCalledWith(
			turnstileSiteverifyUrl,
			expect.objectContaining({
				method: 'POST',
				cache: 'no-store',
			}),
		);
		expect(capturedBody?.get('secret')).toBe('test-secret');
		expect(capturedBody?.get('response')).toBe('valid-token');
	});

	test('rejects a token that Cloudflare marks as invalid', async () => {
		fetchMock.mockResolvedValue(jsonResponse({ success: false }));

		await expect(verifyTurnstileToken('invalid-token')).resolves.toEqual({
			success: false,
			error: 'turnstile-invalid',
		});
	});

	test('returns submission-failed when siteverify is unavailable', async () => {
		fetchMock.mockResolvedValue(jsonResponse({ success: false }, 503));

		await expect(verifyTurnstileToken('valid-token')).resolves.toEqual({
			success: false,
			error: 'submission-failed',
		});
	});

	test('returns submission-failed when siteverify throws', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(verifyTurnstileToken('valid-token')).resolves.toEqual({
			success: false,
			error: 'submission-failed',
		});
	});
});

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
