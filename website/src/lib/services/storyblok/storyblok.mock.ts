import crypto from 'crypto';

const MOCKSERVER_BASE_URL = process.env.MOCKSERVER_URL || 'http://localhost:1080';
const STORYBLOK_HOST = 'api.storyblok.com';

let fetchPatched = false;

function createStableMockHash(url: URL, method: string) {
	// IMPORTANT: clone + normalize URL for hashing
	const normalizedUrl = new URL(url.toString());

	// ignore volatile Storyblok params
	normalizedUrl.searchParams.delete('token');
	normalizedUrl.searchParams.delete('cv');

	const dataToHash = {
		method,
		url: normalizedUrl.pathname + normalizedUrl.search,
	};

	return crypto.createHash('sha512').update(JSON.stringify(dataToHash)).digest('hex');
}

export function patchStoryblokFetch() {
	if (fetchPatched) {
		return;
	}

	const originalFetch: typeof global.fetch = global.fetch;

	global.fetch = (async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
		const url = typeof input === 'string' ? new URL(input) : input instanceof URL ? input : new URL(input.url);

		if (url.protocol === 'https:' && url.hostname === STORYBLOK_HOST) {
			const method = init?.method ?? (input instanceof Request ? input.method : 'GET');

			const mockHash = createStableMockHash(url, method);

			const proxiedUrl = `${MOCKSERVER_BASE_URL}/${url.hostname}${url.pathname}${url.search}`;

			console.log('[Storyblok Mock][FETCH]', {
				originalUrl: url.toString(),
				proxiedUrl,
				mockHash,
			});

			return originalFetch(proxiedUrl, {
				...init,
				headers: {
					...(init?.headers ?? {}),
					'x-mock-hash': mockHash,
				},
			});
		}

		return originalFetch(input, init);
	}) as typeof global.fetch;

	fetchPatched = true;
}
