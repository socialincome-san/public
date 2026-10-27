import 'server-only';

import { Pool } from 'pg';
import { type GalleryImage, type GeneratedImage } from './images';
import { extractUserInput } from './prompts';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const getGalleryBatch = async (offset: number) => {
	const result = await pool.query<Omit<GalleryImage, 'created_at'> & { created_at: Date | null }>(
		'SELECT id, prompt, media_type, created_at FROM generated_images ORDER BY created_at DESC NULLS LAST, id DESC LIMIT 25 OFFSET $1',
		[offset],
	);

	return {
		images: result.rows.slice(0, 24).map((image) => ({
			...image,
			prompt: image.prompt && extractUserInput(image.prompt),
			created_at: image.created_at?.toISOString() ?? null,
		})),
		hasMore: result.rows.length > 24,
	};
};

export const getStoredImage = async (id: string): Promise<{ image_base64: string; media_type: string } | undefined> => {
	const result = await pool.query<{ image_base64: string; media_type: string }>(
		'SELECT image_base64, media_type FROM generated_images WHERE id = $1',
		[id],
	);
	return result.rows[0];
};

export const saveImage = async (prompt: string, image: GeneratedImage): Promise<GalleryImage['id']> => {
	const result = await pool.query<Pick<GalleryImage, 'id'>>(
		'INSERT INTO generated_images (prompt, image_base64, media_type) VALUES ($1, $2, $3) RETURNING id',
		[prompt, image.base64, image.mediaType],
	);

	return result.rows[0].id;
};
