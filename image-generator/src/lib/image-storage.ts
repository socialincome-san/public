import 'server-only';

import { del, put } from '@vercel/blob';
import sharp from 'sharp';
import { type GeneratedImage, type StoredImage } from './images';

export const deleteStoredImages = async ({ imageUrl, previewUrl }: StoredImage) => {
	await del([imageUrl, previewUrl]);
};

export const uploadImage = async (image: GeneratedImage): Promise<StoredImage> => {
	const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[image.mediaType];
	if (!extension) throw new Error('Unsupported image format');
	const original = Buffer.from(image.uint8Array);
	const preview = await sharp(original)
		.rotate()
		.resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 75 })
		.toBuffer();
	const options = { access: 'public', addRandomSuffix: true, cacheControlMaxAge: 31536000 } as const;
	const uploadedOriginal = await put(`images/social-income.${extension}`, original, {
		...options,
		contentType: image.mediaType,
	});
	try {
		const uploadedPreview = await put('previews/social-income.webp', preview, {
			...options,
			contentType: 'image/webp',
		});
		return { imageUrl: uploadedOriginal.url, previewUrl: uploadedPreview.url };
	} catch (error) {
		try {
			await del(uploadedOriginal.url);
		} catch (cleanupError) {
			console.error('Failed to remove orphaned original', uploadedOriginal.url, cleanupError);
		}
		throw error;
	}
};
