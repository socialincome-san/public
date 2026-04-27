import { getStoryblokWebhookSignature, verifyStoryblokWebhookSignature } from './storyblok-webhook-signature';

describe('verifyStoryblokWebhookSignature', () => {
	const secret = 'test-webhook-secret';
	const body = '{"action":"published","full_slug":"journal/foo"}';

	const sign = (payload: string) => getStoryblokWebhookSignature(payload, secret);

	it('returns true when signature matches the raw body', () => {
		expect(verifyStoryblokWebhookSignature(body, sign(body), secret)).toBe(true);
	});

	it('returns false for wrong secret', () => {
		expect(verifyStoryblokWebhookSignature(body, sign(body), 'other-secret')).toBe(false);
	});

	it('returns false for tampered body', () => {
		const sig = sign(body);
		expect(verifyStoryblokWebhookSignature(body + ' ', sig, secret)).toBe(false);
	});

	it('returns false when signature header is missing', () => {
		expect(verifyStoryblokWebhookSignature(body, null, secret)).toBe(false);
	});

	it('returns false when secret is missing', () => {
		expect(verifyStoryblokWebhookSignature(body, sign(body), undefined)).toBe(false);
	});
});
