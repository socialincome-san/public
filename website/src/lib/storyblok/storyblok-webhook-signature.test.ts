import { getStoryblokWebhookSignature, verifyStoryblokWebhookSignature } from './storyblok-webhook-signature';

describe('verifyStoryblokWebhookSignature', () => {
	const secret = 'test-webhook-secret';
	const body = '{"action":"published","full_slug":"journal/foo"}';
	const sign = (payload: string) => getStoryblokWebhookSignature(payload, secret);

	it('accepts a signature matching the raw body', () => {
		expect(verifyStoryblokWebhookSignature(body, sign(body), secret)).toBe(true);
	});

	it('rejects invalid signatures and missing configuration', () => {
		expect(verifyStoryblokWebhookSignature(body, sign(body), 'other-secret')).toBe(false);
		expect(verifyStoryblokWebhookSignature(`${body} `, sign(body), secret)).toBe(false);
		expect(verifyStoryblokWebhookSignature(body, null, secret)).toBe(false);
		expect(verifyStoryblokWebhookSignature(body, sign(body), undefined)).toBe(false);
	});
});
