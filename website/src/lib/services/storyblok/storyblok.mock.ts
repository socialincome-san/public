let patched = false;

export const isStoryblokMockRecordOrReplay = () => ['record', 'replay'].includes(process.env.STORYBLOK_MOCK_MODE ?? '');

export const mockStoryblokIfTestMode = () => {
	if (!isStoryblokMockRecordOrReplay()) {
		return;
	} // only run in mock modes
	if (patched) {
		return;
	} // patch once

	patched = true;

	const MOCK = process.env.MOCKSERVER_URL ?? 'http://localhost:1080';
	const HOST = 'api.storyblok.com';
	const original = globalThis.fetch;

	const hash = async (url: URL, method: string) => {
		url.searchParams.delete('token'); // remove unstable params
		url.searchParams.delete('cv');

		const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${method}:${url.pathname}?${url.search}`));

		return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
	};

	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const requestUrl = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
		const url = new URL(requestUrl);

		return url.protocol === 'https:' && url.hostname === HOST
			? (async () => {
					const proxiedUrl = `${MOCK}/${url.hostname}${url.pathname}${url.search}`;
					console.info('[storyblok-mock] fetch ->', proxiedUrl);

					return original(proxiedUrl, {
						...init,
						headers: {
							...(init?.headers ?? {}),
							'x-mock-hash': await hash(new URL(url.toString()), init?.method ?? 'GET'),
						},
					});
				})()
			: original(input, init); // normal fetch
	}) as typeof fetch;
};
