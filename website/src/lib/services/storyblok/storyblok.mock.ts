let patched = false;

export const mockStoryblokIfTestMode = () => {
	const mode = process.env.STORYBLOK_MOCK_MODE;
	if (!['record', 'replay'].includes(mode ?? '')) {
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

		const buf = await crypto.subtle.digest(
			'SHA-256',
			new TextEncoder().encode(`${method}:${url.pathname}?${url.search}`),
		);

		return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
	};

	globalThis.fetch = (async (input: any, init?: RequestInit) => {
		const url = new URL(typeof input === 'string' ? input : input.url);

		return url.protocol === 'https:' && url.hostname === HOST
			? original(
					`${MOCK}/${url.hostname}${url.pathname}${url.search}`, // proxy to mockserver
					{
						...init,
						headers: {
							...(init?.headers ?? {}),
							'x-mock-hash': await hash(new URL(url.toString()), init?.method ?? 'GET'),
						},
					},
				)
			: original(input, init); // normal fetch
	}) as typeof fetch;
}
