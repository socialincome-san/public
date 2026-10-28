import { generate } from './generator-form';

const previous = { imageSrc: null, error: null, width: 1024, height: 1024 };
const imageUrl = 'https://test.public.blob.vercel-storage.com/images/image.png';
const previewUrl = 'https://test.public.blob.vercel-storage.com/previews/image.webp';

afterEach(() => jest.restoreAllMocks());

test('refreshes the router after saving a generated image', async () => {
	jest
		.spyOn(globalThis, 'fetch')
		.mockResolvedValueOnce(
			Response.json({ error: null, imageUrl, previewUrl, mediaType: 'image/png', width: 1024, height: 1024 }),
		);
	const refresh = jest.fn();
	const form = new FormData();
	form.set('prompt', 'A watercolor bicycle');
	await expect(generate(refresh, previous, form)).resolves.toEqual({ ...previous, imageSrc: imageUrl });
	expect(refresh).toHaveBeenCalledTimes(1);
});

test('does not refresh after a failed generation', async () => {
	jest
		.spyOn(globalThis, 'fetch')
		.mockResolvedValueOnce(
			Response.json(
				{ error: 'Generation failed', imageUrl: null, previewUrl: null, mediaType: null, width: null, height: null },
				{ status: 500 },
			),
		);
	const refresh = jest.fn();
	const form = new FormData();
	form.set('prompt', 'A watercolor bicycle');
	await expect(generate(refresh, previous, form)).resolves.toEqual({ ...previous, error: 'Generation failed' });
	expect(refresh).not.toHaveBeenCalled();
});

test('does not request or refresh for an empty prompt', async () => {
	const request = jest.spyOn(globalThis, 'fetch');
	const refresh = jest.fn();
	await expect(generate(refresh, previous, new FormData())).resolves.toEqual(previous);
	expect(request).not.toHaveBeenCalled();
	expect(refresh).not.toHaveBeenCalled();
});
