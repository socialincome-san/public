import { getGalleryImages } from '@/lib/database';
import { GET } from './route';

jest.mock('@/lib/database', () => ({ getGalleryImages: jest.fn() }));

beforeEach(() => jest.resetAllMocks());
afterEach(() => jest.restoreAllMocks());

test('returns the complete gallery list without caching the response', async () => {
	const images = [
		{
			id: '2',
			prompt: 'A bicycle',
			costUsd: 0.06,
			createdAt: '2026-11-02T12:00:00Z',
			previewUrl: 'https://test.public.blob.vercel-storage.com/previews/bicycle.webp',
		},
		{
			id: '1',
			prompt: null,
			costUsd: null,
			createdAt: null,
			previewUrl: 'https://test.public.blob.vercel-storage.com/previews/scene.webp',
		},
	];
	jest.mocked(getGalleryImages).mockResolvedValueOnce(images);

	const response = await GET();

	expect(response.status).toBe(200);
	expect(response.headers.get('Cache-Control')).toBe('private, no-store');
	expect(await response.json()).toEqual({ images });
	expect(getGalleryImages).toHaveBeenCalledTimes(1);
});

test('returns an empty list when there are no images', async () => {
	jest.mocked(getGalleryImages).mockResolvedValueOnce([]);

	const response = await GET();

	expect(response.status).toBe(200);
	expect(await response.json()).toEqual({ images: [] });
});

test('logs database failures and returns a generic error without caching it', async () => {
	const error = new Error('Database connection details');
	jest.mocked(getGalleryImages).mockRejectedValueOnce(error);
	jest.spyOn(console, 'error').mockImplementation(() => {});

	const response = await GET();

	expect(response.status).toBe(500);
	expect(response.headers.get('Cache-Control')).toBe('private, no-store');
	expect(await response.json()).toEqual({ error: 'Images could not be loaded. Please try again.' });
	expect(console.error).toHaveBeenCalledWith('Loading gallery images failed', error);
});
