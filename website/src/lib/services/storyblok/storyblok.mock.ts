const MOCKSERVER_BASE_URL = process.env.MOCKSERVER_URL || 'http://localhost:1080';
const STORYBLOK_HOST = 'api.storyblok.com';

let fetchPatched = false;

export function patchStoryblokFetch() {
	if (fetchPatched) {
		return;
	}

	const originalFetch: typeof global.fetch = global.fetch;

	global.fetch = (async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
		const url = typeof input === 'string' ? new URL(input) : input instanceof URL ? input : new URL(input.url);

		if (url.protocol === 'https:' && url.hostname === STORYBLOK_HOST) {
			const proxiedUrl = `${MOCKSERVER_BASE_URL}/${url.hostname}${url.pathname}${url.search}`;

			console.log('[Storyblok Mock][FETCH]', {
				originalUrl: url.toString(),
				finalUrl: proxiedUrl,
			});

			return originalFetch(proxiedUrl, init);
		}

		return originalFetch(input, init);
	}) as typeof global.fetch;

	fetchPatched = true;
}
