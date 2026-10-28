import 'server-only';

import { Pool } from 'pg';

import { isConfirmedWriteFailure } from './database-errors';
import { deleteStoredImages, uploadImage } from './image-storage';
import { type GalleryImage, type GeneratedImage } from './images';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const getGalleryBatch = async (offset: number) => {
	const result = await pool.query<Omit<GalleryImage, 'created_at'> & { created_at: Date | null }>(
		'SELECT id, prompt, media_type, created_at, image_url AS "imageUrl", preview_url AS "previewUrl" FROM generated_images WHERE image_url IS NOT NULL AND preview_url IS NOT NULL ORDER BY created_at DESC NULLS LAST, id DESC LIMIT 25 OFFSET $1',
		[offset],
	);

	return {
		images: result.rows.slice(0, 24).map((image) => ({
			...image,
			created_at: image.created_at?.toISOString() ?? null,
		})),
		hasMore: result.rows.length > 24,
	};
};

export const saveImage = async (prompt: string, image: GeneratedImage) => {
	const stored = await uploadImage(image);
	try {
		await pool.query('INSERT INTO generated_images (prompt, image_url, preview_url, media_type) VALUES ($1, $2, $3, $4)', [
			prompt,
			stored.imageUrl,
			stored.previewUrl,
			image.mediaType,
		]);
	} catch (error) {
		if (isConfirmedWriteFailure(error)) {
			try {
				await deleteStoredImages(stored);
			} catch (cleanupError) {
				console.error('Failed to remove orphaned images', stored, cleanupError);
			}
		} else {
			console.error('Image insert outcome unknown; retained blobs for verification', stored, error);
		}
		throw error;
	}
	return stored;
};
