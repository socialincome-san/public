const MOCKSERVER_BASE_URL = 'http://localhost:1080';
const STORYBLOK_ORIGIN = 'https://api.storyblok.com';

let fetchPatched = false;

export function patchStoryblokFetch() {
	if (fetchPatched) {
		return;
	}

	const originalFetch: typeof global.fetch = global.fetch;

	global.fetch = (async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
		const originalUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

		if (originalUrl.startsWith(STORYBLOK_ORIGIN)) {
			const finalUrl = MOCKSERVER_BASE_URL + originalUrl.replace('https://', '/');

			console.log('[Storyblok Mock][FETCH]', {
				originalUrl,
				finalUrl,
			});

			return originalFetch(finalUrl, init);
		}

		return originalFetch(input, init);
	}) as typeof global.fetch;

	fetchPatched = true;
}
