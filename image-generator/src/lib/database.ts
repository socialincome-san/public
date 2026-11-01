import 'server-only';

import { Pool } from 'pg';
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
		`SELECT image.id, image.prompt, image.media_type, image.created_at, image.cost_usd
		FROM generated_images image
		WHERE image.status = 'active' AND ($1::text IS NULL OR EXISTS (
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

export const getStoredImage = async (id: string): Promise<{ image_base64: string; media_type: string } | undefined> => {
	const result = await pool.query<{ image_base64: string; media_type: string }>(
		"SELECT image_base64, media_type FROM generated_images WHERE id = $1 AND status = 'active'",
		[id],
	);
	return result.rows[0];
};

export const saveImage = async (prompt: string, image: GeneratedImage, costUsd: number | null): Promise<GalleryImage> => {
	const result = await pool.query<GalleryRow>(
		'INSERT INTO generated_images (prompt, image_base64, media_type, cost_usd) VALUES ($1, $2, $3, $4) RETURNING id, prompt, media_type, created_at, cost_usd',
		[prompt, image.base64, image.mediaType, costUsd],
	);

	return toGalleryImage(result.rows[0]);
};

export const deleteImage = async (id: string): Promise<boolean> => {
	const result = await pool.query("UPDATE generated_images SET status = 'deleted' WHERE id = $1 AND status = 'active'", [
		id,
	]);
	return result.rowCount === 1;
};
