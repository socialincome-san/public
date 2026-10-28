import { requestImage } from './request-image';

const imageUrl = 'https://test.public.blob.vercel-storage.com/images/image.png';
const previewUrl = 'https://test.public.blob.vercel-storage.com/previews/image.webp';
const image = {
	id: '1',
	prompt: 'A bicycle',
	media_type: 'image/png',
	created_at: null,
	imageUrl,
	previewUrl,
	width: 1024,
	height: 1024,
};

afterEach(() => jest.restoreAllMocks());

test('refreshes the router after saving a generated image', async () => {
	jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json({ image }));
	const refresh = jest.fn();
	const form = new FormData();
	form.set('prompt', 'A watercolor bicycle');
	await expect(requestImage('/api/generate-image', form, refresh)).resolves.toEqual({ image });
	expect(refresh).toHaveBeenCalledTimes(1);
});

test('does not refresh after a failed generation', async () => {
	jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json({ error: 'Generation failed' }, { status: 500 }));
	const refresh = jest.fn();
	const form = new FormData();
	form.set('prompt', 'A watercolor bicycle');
	await expect(requestImage('/api/generate-image', form, refresh)).resolves.toEqual({ error: 'Generation failed' });
	expect(refresh).not.toHaveBeenCalled();
});

test('does not refresh when the request fails', async () => {
	jest.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
	const refresh = jest.fn();
	await expect(requestImage('/api/generate-image', new FormData(), refresh)).resolves.toEqual({
		error: 'Image generation failed. Please try again.',
	});
	expect(refresh).not.toHaveBeenCalled();
});
