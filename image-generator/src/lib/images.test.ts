import { imageDownloadUrl, isGalleryBatch, isImageResponse, imageUrl as transparentImageUrl } from './images';

const imageUrl = 'https://test.public.blob.vercel-storage.com/images/social-income.png';
const previewUrl = 'https://test.public.blob.vercel-storage.com/previews/social-income.webp';

test('builds a cross-origin attachment URL without duplicating query parameters', () => {
	expect(imageDownloadUrl(imageUrl)).toBe(`${imageUrl}?download=1`);
	expect(imageDownloadUrl(`${imageUrl}?download=0&other=1`)).toBe(`${imageUrl}?download=1&other=1`);
});

test('validates generated URL responses and error responses', () => {
	const image = {
		id: '1',
		prompt: null,
		media_type: 'image/png',
		created_at: null,
		imageUrl,
		previewUrl,
		width: 1024,
		height: 1024,
	};
	expect(isImageResponse({ image })).toBe(true);
	expect(isImageResponse({ error: 'Failed' })).toBe(true);
	expect(isImageResponse({ image: { ...image, imageUrl: undefined } })).toBe(false);
	expect(isImageResponse({ image: { ...image, previewUrl: 123 } })).toBe(false);
	expect(isImageResponse({ image: { ...image, width: 0 } })).toBe(false);
});

test('only builds the per-image route for transparent cutouts', () => {
	expect(transparentImageUrl('1')).toBe('/api/gallery-images/1?variant=transparent');
	expect(transparentImageUrl('1', { download: true })).toBe('/api/gallery-images/1?variant=transparent&download=1');
});

test('requires both URLs on every gallery image', () => {
	const image = { id: 1, prompt: null, media_type: 'image/png', created_at: null, imageUrl, previewUrl };
	expect(isGalleryBatch({ images: [image], hasMore: false })).toBe(true);
	expect(isGalleryBatch({ images: [{ ...image, imageUrl: null }], hasMore: false })).toBe(false);
	expect(isGalleryBatch({ images: [{ ...image, previewUrl: undefined }], hasMore: false })).toBe(false);
});
