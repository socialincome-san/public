export async function mockStoryblokIfTestMode() {
	if (process.env.STORYBLOK_MOCK_MODE !== 'record' && process.env.STORYBLOK_MOCK_MODE !== 'replay') {
		console.log('[Storyblok Mock] disabled (STORYBLOK_MOCK_MODE not set)');
		return;
	}

	console.log('[Storyblok Mock] enabled via instrumentation', {
		mode: process.env.STORYBLOK_MOCK_MODE,
	});

	const MOCKSERVER_BASE_URL = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
	const STORYBLOK_HOST = 'api.storyblok.com';

	let fetchPatched = false;

	async function stableHash(url: URL, method: string): Promise<string> {
		// remove unstable params
		const cleanUrl = new URL(url.toString());
		cleanUrl.searchParams.delete('token');
		cleanUrl.searchParams.delete('cv');

		const encoder = new TextEncoder();
		const data = encoder.encode(`${method}:${cleanUrl.pathname}?${cleanUrl.search}`);

		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));

		return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	}

	function patchStoryblokFetch() {
		if (fetchPatched) return;
		fetchPatched = true;

		const originalFetch = globalThis.fetch;

		globalThis.fetch = (async (input: any, init?: RequestInit) => {
			const url = typeof input === 'string' ? new URL(input) : input instanceof URL ? input : new URL(input.url);

			if (url.protocol === 'https:' && url.hostname === STORYBLOK_HOST) {
				const method = init?.method ?? 'GET';
				const hash = await stableHash(url, method);

				const proxiedUrl = `${MOCKSERVER_BASE_URL}/${url.hostname}${url.pathname}${url.search}`;

				return originalFetch(proxiedUrl, {
					...init,
					headers: {
						...(init?.headers ?? {}),
						'x-mock-hash': hash,
					},
				});
			}

			return originalFetch(input, init);
		}) as typeof fetch;

		console.log('[Storyblok Mock] fetch patched (Edge)', {
			mockserver: MOCKSERVER_BASE_URL,
		});
	}

	patchStoryblokFetch();
}
