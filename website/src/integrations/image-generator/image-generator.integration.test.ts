import { fetchImageGeneratorGallery } from './image-generator.integration';

jest.mock('server-only', () => ({}));

const image = {
	id: '1',
	prompt: 'A bicycle',
	costUsd: 0.06,
	createdAt: '2026-11-02T12:00:00Z',
	previewUrl: 'https://jjjjivv3brvymvql.public.blob.vercel-storage.com/previews/bicycle.webp',
};

beforeEach(() => {
	jest.replaceProperty(process, 'env', {
		...process.env,
		IMAGE_GENERATOR_URL: 'https://image-generator.example.com',
		IMAGE_GENERATOR_PASSWORD: 'test-password',
	});
	jest.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ images: [image] }));
	jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

test('fetches validated images with server-side Basic Auth and no fetch cache or redirects', async () => {
	const timeout = jest.spyOn(AbortSignal, 'timeout');
	await expect(fetchImageGeneratorGallery()).resolves.toEqual({ success: true, data: [image], status: undefined });
	expect(fetch).toHaveBeenCalledWith(
		new URL('https://image-generator.example.com/api/gallery'),
		expect.objectContaining({
			headers: {
				Accept: 'application/json',
				Authorization: `Basic ${Buffer.from(':test-password').toString('base64')}`,
			},
			cache: 'no-store',
			redirect: 'error',
		}),
	);
	expect(timeout).toHaveBeenCalledWith(10_000);
});

test('uses the full password including colons and non-ASCII characters', async () => {
	process.env.IMAGE_GENERATOR_PASSWORD = 'páss:word';
	await fetchImageGeneratorGallery();
	expect(jest.mocked(fetch).mock.calls[0]?.[1]?.headers).toEqual({
		Accept: 'application/json',
		Authorization: `Basic ${Buffer.from(':páss:word').toString('base64')}`,
	});
});

test('accepts an empty gallery', async () => {
	jest.mocked(fetch).mockResolvedValueOnce(Response.json({ images: [] }));
	await expect(fetchImageGeneratorGallery()).resolves.toEqual({ success: true, data: [], status: undefined });
});

test('accepts older gallery responses without creation time', async () => {
	jest.mocked(fetch).mockResolvedValueOnce(
		Response.json({
			images: [
				{
					id: image.id,
					prompt: image.prompt,
					previewUrl: image.previewUrl,
					costUsd: image.costUsd,
				},
			],
		}),
	);
	await expect(fetchImageGeneratorGallery()).resolves.toMatchObject({
		success: true,
		data: [{ ...image, createdAt: null }],
	});
});

test.each(['not a date', 42])('rejects invalid creation time %s', async (createdAt) => {
	jest.mocked(fetch).mockResolvedValueOnce(Response.json({ images: [{ ...image, createdAt }] }));
	await expect(fetchImageGeneratorGallery()).resolves.toMatchObject({ success: false });
});

test('accepts numeric IDs and missing prompts and strips unexpected fields', async () => {
	jest
		.mocked(fetch)
		.mockResolvedValueOnce(Response.json({ images: [{ ...image, id: 42, prompt: null, internalMetadata: 'private' }] }));
	await expect(fetchImageGeneratorGallery()).resolves.toEqual({
		success: true,
		data: [{ ...image, id: 42, prompt: null }],
		status: undefined,
	});
});

test.each([0, null])('accepts zero and unavailable generation costs: %s', async (costUsd) => {
	jest.mocked(fetch).mockResolvedValueOnce(Response.json({ images: [{ ...image, costUsd }] }));
	await expect(fetchImageGeneratorGallery()).resolves.toMatchObject({ success: true, data: [{ ...image, costUsd }] });
});

test.each([-1, '0.06'])('rejects invalid generation cost %s', async (costUsd) => {
	jest.mocked(fetch).mockResolvedValueOnce(Response.json({ images: [{ ...image, costUsd }] }));
	await expect(fetchImageGeneratorGallery()).resolves.toMatchObject({ success: false });
});

test.each(['IMAGE_GENERATOR_URL', 'IMAGE_GENERATOR_PASSWORD'])('does not fetch when %s is missing', async (key) => {
	delete process.env[key];
	await expect(fetchImageGeneratorGallery()).resolves.toEqual({
		success: false,
		error: 'Image generator is not configured.',
		status: undefined,
	});
	expect(fetch).not.toHaveBeenCalled();
});

test.each(['http://localhost:3001', 'http://127.0.0.1:3001', 'http://[::1]:3001'])(
	'allows local development at %s',
	async (baseUrl) => {
		process.env.IMAGE_GENERATOR_URL = baseUrl;
		await expect(fetchImageGeneratorGallery()).resolves.toMatchObject({ success: true });
		expect(fetch).toHaveBeenCalledWith(new URL('/api/gallery', baseUrl), expect.any(Object));
	},
);

test.each(['not a URL', 'http://image-generator.example.com', 'ftp://example.com', 'https://user:secret@example.com'])(
	'rejects unsafe or malformed generator URL %s without sending credentials',
	async (baseUrl) => {
		process.env.IMAGE_GENERATOR_URL = baseUrl;
		await expect(fetchImageGeneratorGallery()).resolves.toMatchObject({ success: false });
		expect(fetch).not.toHaveBeenCalled();
	},
);

test.each([
	'https://other.public.blob.vercel-storage.com/previews/bicycle.webp',
	'https://jjjjivv3brvymvql.public.blob.vercel-storage.com.evil.example/previews/bicycle.webp',
	'https://jjjjivv3brvymvql.public.blob.vercel-storage.com@evil.example/previews/bicycle.webp',
	'http://jjjjivv3brvymvql.public.blob.vercel-storage.com/previews/bicycle.webp',
	'https://jjjjivv3brvymvql.public.blob.vercel-storage.com:444/previews/bicycle.webp',
	'https://user:secret@jjjjivv3brvymvql.public.blob.vercel-storage.com/previews/bicycle.webp',
	'https://jjjjivv3brvymvql.public.blob.vercel-storage.com/images/original.png',
	'/previews/bicycle.webp',
	'not a URL',
])('rejects untrusted preview URL %s', async (previewUrl) => {
	jest.mocked(fetch).mockResolvedValueOnce(Response.json({ images: [image, { ...image, previewUrl }] }));
	await expect(fetchImageGeneratorGallery()).resolves.toEqual({
		success: false,
		error: 'Image generator gallery response is invalid.',
		status: undefined,
	});
});

test.each([
	null,
	{},
	{ images: null },
	{ images: {} },
	{ images: [null] },
	{ images: [{ ...image, id: '' }] },
	{ images: [{ ...image, id: -1 }] },
	{ images: [{ ...image, prompt: 42 }] },
	{ images: [{ id: '1', previewUrl: image.previewUrl }] },
])('rejects malformed payload %j', async (payload) => {
	jest.mocked(fetch).mockResolvedValueOnce(Response.json(payload));
	await expect(fetchImageGeneratorGallery()).resolves.toMatchObject({
		success: false,
		error: 'Image generator gallery response is invalid.',
	});
});

test.each([401, 403, 404, 500, 503])('returns a generic failure for HTTP %i', async (status) => {
	jest.mocked(fetch).mockResolvedValueOnce(new Response('Private upstream details', { status }));
	await expect(fetchImageGeneratorGallery()).resolves.toEqual({
		success: false,
		error: 'Image generator gallery could not be loaded.',
		status: undefined,
	});
	expect(console.error).toHaveBeenCalledWith('Image generator gallery request failed', { status });
});

test('returns a generic failure when the response is not JSON', async () => {
	jest.mocked(fetch).mockResolvedValueOnce(new Response('Not JSON'));
	await expect(fetchImageGeneratorGallery()).resolves.toMatchObject({ success: false });
});

test.each([new Error('Network unavailable'), new DOMException('Request timed out', 'TimeoutError')])(
	'returns a generic failure when fetching fails: %s',
	async (error) => {
		jest.mocked(fetch).mockRejectedValueOnce(error);
		await expect(fetchImageGeneratorGallery()).resolves.toEqual({
			success: false,
			error: 'Image generator gallery could not be loaded.',
			status: undefined,
		});
	},
);
