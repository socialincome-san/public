import { verifyStoryblokWebhook } from '@/modules/storyblok-content/storyblok-content.service';
import { STORYBLOK_CACHE_TAG } from '@/modules/storyblok-content/storyblok-content.types';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Storyblok webhook target: revalidate cached Storyblok content after content changes. A story can appear on
 * many pages (teasers, related articles, navigation), so all Storyblok reads share one cache tag.
 * Storyblok signs the raw body; we verify the `webhook-signature` header (HMAC-SHA1 hex) against
 * `STORYBLOK_WEBHOOK_SECRET`, which must match the webhook's "Secret key".
 * @see https://www.storyblok.com/tp/webhook-secret-with-different-technologies
 */
export const POST = async (request: NextRequest) => {
	const rawBody = await request.text();
	const signature = request.headers.get('webhook-signature');

	const verification = verifyStoryblokWebhook(rawBody, signature);
	if (!verification.success) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	revalidateTag(STORYBLOK_CACHE_TAG, 'max');

	return NextResponse.json({ revalidated: true });
};
