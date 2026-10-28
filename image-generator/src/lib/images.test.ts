import { imageDownloadUrl, isGalleryBatch, isGenerateResponse } from './images';

const imageUrl = 'https://test.public.blob.vercel-storage.com/images/social-income.png';
const previewUrl = 'https://test.public.blob.vercel-storage.com/previews/social-income.webp';

test('builds a cross-origin attachment URL without duplicating query parameters', () => {
	expect(imageDownloadUrl(imageUrl)).toBe(`${imageUrl}?download=1`);
	expect(imageDownloadUrl(`${imageUrl}?download=0&other=1`)).toBe(`${imageUrl}?download=1&other=1`);
});

test('validates generated URL responses and error responses', () => {
	expect(isGenerateResponse({ error: null, imageUrl, previewUrl, mediaType: 'image/png', width: 1024, height: 1024 })).toBe(
		true,
	);
	expect(
		isGenerateResponse({ error: 'Failed', imageUrl: null, previewUrl: null, mediaType: null, width: null, height: null }),
	).toBe(true);
	expect(isGenerateResponse({ error: null, imageBase64: 'legacy', mediaType: 'image/png', width: 1024, height: 1024 })).toBe(
		false,
	);
	expect(
		isGenerateResponse({ error: null, imageUrl, previewUrl: 123, mediaType: 'image/png', width: 1024, height: 1024 }),
	).toBe(false);
});

test('requires both URLs on every gallery image', () => {
	const image = { id: 1, prompt: null, media_type: 'image/png', created_at: null, imageUrl, previewUrl };
	expect(isGalleryBatch({ images: [image], hasMore: false })).toBe(true);
	expect(isGalleryBatch({ images: [{ ...image, imageUrl: null }], hasMore: false })).toBe(false);
	expect(isGalleryBatch({ images: [{ ...image, previewUrl: undefined }], hasMore: false })).toBe(false);
});
