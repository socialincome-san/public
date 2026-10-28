import { del, put } from '@vercel/blob';
import sharp from 'sharp';
import { deleteStoredImages, uploadImage } from './image-storage';

jest.mock('server-only', () => ({}));
jest.mock('@vercel/blob', () => ({ put: jest.fn(), del: jest.fn() }));

const originalUrl = 'https://test.public.blob.vercel-storage.com/images/social-income-random.png';
const previewUrl = 'https://test.public.blob.vercel-storage.com/previews/social-income-random.webp';
const blob = (url: string) => ({
	url,
	downloadUrl: `${url}?download=1`,
	pathname: '',
	contentType: 'image/png',
	contentDisposition: '',
	etag: 'test-etag',
});

beforeEach(() => {
	jest.resetAllMocks();
	jest.mocked(del).mockResolvedValue(undefined);
});

test('uploads the unchanged original and an 800px WebP preview with public, immutable URLs', async () => {
	const original = await sharp({ create: { width: 1600, height: 1200, channels: 3, background: '#ffffff' } })
		.png()
		.toBuffer();
	jest.mocked(put).mockResolvedValueOnce(blob(originalUrl)).mockResolvedValueOnce(blob(previewUrl));

	await expect(uploadImage({ uint8Array: original, mediaType: 'image/png' })).resolves.toEqual({
		imageUrl: originalUrl,
		previewUrl,
	});
	expect(put).toHaveBeenNthCalledWith(1, 'images/social-income.png', original, {
		access: 'public',
		addRandomSuffix: true,
		cacheControlMaxAge: 31536000,
		contentType: 'image/png',
	});
	expect(put).toHaveBeenNthCalledWith(2, 'previews/social-income.webp', expect.any(Buffer), {
		access: 'public',
		addRandomSuffix: true,
		cacheControlMaxAge: 31536000,
		contentType: 'image/webp',
	});
	const preview = jest.mocked(put).mock.calls[1]?.[1];
	if (!Buffer.isBuffer(preview)) throw new Error('Expected a preview buffer');
	const metadata = await sharp(preview).metadata();
	expect(metadata).toMatchObject({ width: 800, height: 600, format: 'webp' });
	expect(del).not.toHaveBeenCalled();
});

test.each([
	['image/jpeg', 'jpg'],
	['image/webp', 'webp'],
])('uses the matching extension for %s without enlarging previews', async (mediaType, extension) => {
	const input = sharp({ create: { width: 100, height: 50, channels: 3, background: '#ffffff' } });
	const original = mediaType === 'image/jpeg' ? await input.jpeg().toBuffer() : await input.webp().toBuffer();
	jest.mocked(put).mockResolvedValueOnce(blob(originalUrl)).mockResolvedValueOnce(blob(previewUrl));
	await uploadImage({ uint8Array: original, mediaType });
	expect(put).toHaveBeenNthCalledWith(
		1,
		`images/social-income.${extension}`,
		original,
		expect.objectContaining({ contentType: mediaType }),
	);
	const preview = jest.mocked(put).mock.calls[1]?.[1];
	if (!Buffer.isBuffer(preview)) throw new Error('Expected a preview buffer');
	expect(await sharp(preview).metadata()).toMatchObject({ width: 100, height: 50, format: 'webp' });
});

test('removes the original when the preview upload fails', async () => {
	const original = await sharp({ create: { width: 10, height: 10, channels: 3, background: '#ffffff' } })
		.png()
		.toBuffer();
	jest.mocked(put).mockResolvedValueOnce(blob(originalUrl)).mockRejectedValueOnce(new Error('Preview upload failed'));
	await expect(uploadImage({ uint8Array: original, mediaType: 'image/png' })).rejects.toThrow('Preview upload failed');
	expect(del).toHaveBeenCalledWith(originalUrl);
});

test('rejects unsupported or corrupt images before uploading', async () => {
	await expect(uploadImage({ uint8Array: new Uint8Array(), mediaType: 'image/svg+xml' })).rejects.toThrow(
		'Unsupported image format',
	);
	await expect(uploadImage({ uint8Array: new Uint8Array(), mediaType: 'image/png' })).rejects.toThrow();
	expect(put).not.toHaveBeenCalled();
});

test('deletes both stored variants together', async () => {
	await deleteStoredImages({ imageUrl: originalUrl, previewUrl });
	expect(del).toHaveBeenCalledWith([originalUrl, previewUrl]);
});
