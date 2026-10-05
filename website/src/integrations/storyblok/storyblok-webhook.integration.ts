import { createHmac, timingSafeEqual } from 'node:crypto';

export const getStoryblokWebhookSignature = (body: string, secret: string): string =>
	createHmac('sha1', secret).update(body).digest('hex');

export const verifyStoryblokWebhookSignature = (
	rawBody: string,
	signatureHeader: string | null,
	secret: string | undefined,
): boolean => {
	if (!secret || !signatureHeader) {
		return false;
	}
	const expectedHex = getStoryblokWebhookSignature(rawBody, secret).toLowerCase();
	const receivedHex = signatureHeader.trim().toLowerCase();
	if (expectedHex.length !== receivedHex.length) {
		return false;
	}
	try {
		return timingSafeEqual(Buffer.from(expectedHex, 'utf8'), Buffer.from(receivedHex, 'utf8'));
	} catch {
		return false;
	}
};
