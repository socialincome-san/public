import { fetchImageGeneratorGallery } from '@/integrations/image-generator/image-generator.integration';
import { resultFail, resultOk } from '@/lib/result';
import { cacheLife, cacheTag } from 'next/cache';
import { getImageGeneratorGalleryAction } from './image-generator-gallery.actions';
import { getImageGeneratorGallery } from './image-generator-gallery.cache';
import { IMAGE_GENERATOR_GALLERY_CACHE_TAG } from './image-generator-gallery.types';

jest.mock('next/cache', () => ({ cacheLife: jest.fn(), cacheTag: jest.fn() }));
jest.mock('@/integrations/image-generator/image-generator.integration', () => ({ fetchImageGeneratorGallery: jest.fn() }));

beforeEach(() => {
	jest.resetAllMocks();
	jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

test('tags successful gallery results and uses the days profile', async () => {
	const result = resultOk([
		{
			id: '2',
			prompt: 'A bicycle',
			previewUrl: 'https://example.com/previews/bicycle.webp',
			imageUrl: 'https://example.com/images/bicycle.png',
			costUsd: 0.06,
			createdAt: '2026-11-02T12:00:00Z',
		},
		{
			id: '1',
			prompt: null,
			previewUrl: 'https://example.com/previews/scene.webp',
			imageUrl: null,
			costUsd: null,
			createdAt: null,
		},
	]);
	jest.mocked(fetchImageGeneratorGallery).mockResolvedValueOnce(result);

	await expect(getImageGeneratorGallery()).resolves.toBe(result);
	expect(cacheTag).toHaveBeenCalledWith(IMAGE_GENERATOR_GALLERY_CACHE_TAG);
	expect(cacheLife).toHaveBeenCalledWith('days');
	expect(cacheLife).toHaveBeenCalledTimes(1);
	expect(fetchImageGeneratorGallery).toHaveBeenCalledTimes(1);
	expect(console.error).not.toHaveBeenCalled();
});

test('tags failures but uses only the minutes profile', async () => {
	const result = resultFail('Unavailable.');
	jest.mocked(fetchImageGeneratorGallery).mockResolvedValueOnce(result);

	await expect(getImageGeneratorGallery()).resolves.toBe(result);
	expect(cacheTag).toHaveBeenCalledWith(IMAGE_GENERATOR_GALLERY_CACHE_TAG);
	expect(cacheLife).toHaveBeenCalledWith('minutes');
	expect(cacheLife).toHaveBeenCalledTimes(1);
	expect(console.error).toHaveBeenCalledWith('Loading image generator gallery failed', { error: 'Unavailable.' });
});

test('the action returns the cached gallery result', async () => {
	const result = resultOk([]);
	jest.mocked(fetchImageGeneratorGallery).mockResolvedValueOnce(result);

	await expect(getImageGeneratorGalleryAction()).resolves.toBe(result);
	expect(cacheTag).toHaveBeenCalledWith(IMAGE_GENERATOR_GALLERY_CACHE_TAG);
	expect(cacheLife).toHaveBeenCalledWith('days');
	expect(fetchImageGeneratorGallery).toHaveBeenCalledTimes(1);
	expect(console.error).not.toHaveBeenCalled();
});
