import { pathsForStory } from '@/lib/services/storyblok/revalidation';
import { verifyStoryblokWebhookSignature } from '@/lib/services/storyblok/storyblok-webhook-signature';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type WebhookPayload = {
	action?: string;
	full_slug?: string;
};

/**
 * Storyblok webhook target: revalidate cached pages after content changes.
 * Storyblok signs the raw body; we verify the `webhook-signature` header (HMAC-SHA1 hex) against
 * `STORYBLOK_WEBHOOK_SECRET`, which must match the webhook's "Secret key".
 * @see https://www.storyblok.com/tp/webhook-secret-with-different-technologies
 */
export const POST = async (request: NextRequest) => {
	const rawBody = await request.text();
	const signature = request.headers.get('webhook-signature');

	if (!verifyStoryblokWebhookSignature(rawBody, signature, process.env.STORYBLOK_WEBHOOK_SECRET)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: WebhookPayload;
	try {
		body = JSON.parse(rawBody) as WebhookPayload;
	} catch {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const paths = pathsForStory(body.full_slug);
	for (const path of paths) {
		revalidatePath(path);
	}

	return NextResponse.json({ revalidated: paths.length });
};
