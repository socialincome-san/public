import 'server-only';

import { Pool, type QueryResult } from 'pg';

import { isConfirmedWriteFailure } from './database-errors';
import { deleteStoredImages, uploadImage } from './image-storage';
import { type GalleryImage, type GeneratedImage } from './images';
import { extractUserInput } from './prompts';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const BATCH_SIZE = 24;

type GalleryRow = Omit<GalleryImage, 'created_at'> & { created_at: Date | null };

const toGalleryImage = (row: GalleryRow): GalleryImage => ({
	...row,
	prompt: row.prompt && extractUserInput(row.prompt),
	created_at: row.created_at?.toISOString() ?? null,
});

/**
 * The newest images, or with `afterId` the ones that follow that image. A cursor instead of an offset keeps
 * batches stable when new images are added while someone scrolls.
 */
export const getGalleryBatch = async (afterId?: string) => {
	// Mirrors ORDER BY created_at DESC NULLS LAST, id DESC: rows without a date come last, ordered by id.
	const result = await pool.query<GalleryRow>(
		`SELECT image.id, image.prompt, image.media_type, image.created_at, image.cost_usd,
			image.image_url AS "imageUrl", image.preview_url AS "previewUrl"
		FROM generated_images image
		WHERE image.status = 'active' AND image.image_url IS NOT NULL AND image.preview_url IS NOT NULL AND ($1::text IS NULL OR EXISTS (
			SELECT 1 FROM generated_images after_image
			WHERE after_image.id::text = $1 AND (
				CASE WHEN after_image.created_at IS NULL
				THEN image.created_at IS NULL AND image.id < after_image.id
				ELSE image.created_at < after_image.created_at
					OR (image.created_at = after_image.created_at AND image.id < after_image.id)
					OR image.created_at IS NULL
				END
			)
		))
		ORDER BY image.created_at DESC NULLS LAST, image.id DESC
		LIMIT $2`,
		[afterId ?? null, BATCH_SIZE + 1],
	);

	return {
		images: result.rows.slice(0, BATCH_SIZE).map(toGalleryImage),
		hasMore: result.rows.length > BATCH_SIZE,
	};
};

export const getStoredImage = async (id: string): Promise<{ imageUrl: string; media_type: string } | undefined> => {
	const result = await pool.query<{ imageUrl: string; media_type: string }>(
		'SELECT image_url AS "imageUrl", media_type FROM generated_images WHERE id = $1 AND status = \'active\' AND image_url IS NOT NULL',
		[id],
	);
	return result.rows[0];
};

export const saveImage = async (prompt: string, image: GeneratedImage, costUsd: number | null): Promise<GalleryImage> => {
	const stored = await uploadImage(image);
	let result: QueryResult<GalleryRow>;
	try {
		result = await pool.query<GalleryRow>(
			'INSERT INTO generated_images (prompt, image_url, preview_url, media_type, cost_usd) VALUES ($1, $2, $3, $4, $5) RETURNING id, prompt, media_type, created_at, cost_usd, image_url AS "imageUrl", preview_url AS "previewUrl"',
			[prompt, stored.imageUrl, stored.previewUrl, image.mediaType, costUsd],
		);
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
	return toGalleryImage(result.rows[0]);
};

export const deleteImage = async (id: string): Promise<boolean> => {
	const result = await pool.query("UPDATE generated_images SET status = 'deleted' WHERE id = $1 AND status = 'active'", [
		id,
	]);
	return result.rowCount === 1;
};
