import { isSessionValid } from '../session';

export async function GET(request: Request) {
	const authenticated = await isSessionValid();
	if (!authenticated) {
		return new Response('Unauthorized', { status: 401 });
	}
	const imageUrl = new URL(request.url).searchParams.get('url');
	if (!imageUrl) {
		return new Response('Missing address', { status: 400 });
	}
	const ALLOWED_HOSTS = ['v3.fal.media', 'v3b.fal.media'];
	let target: URL;
	try {
		target = new URL(imageUrl);
	} catch {
		return new Response('Invalid url', { status: 400 });
	}

	if (target.protocol !== 'https:' || !ALLOWED_HOSTS.includes(target.hostname)) {
		return new Response('Host not allowed ', { status: 400 });
	}
	const response = await fetch(target);
	if (!response.ok || !response.body) {
		return new Response('Download failed', { status: 502 });
	}

	return new Response(response.body, {
		headers: {
			'Content-Type': 'image/png',
			'Content-Disposition': 'attachment; filename="image.png"',
		},
	});
}
