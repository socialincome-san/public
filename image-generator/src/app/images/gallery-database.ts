import { Pool } from 'pg';
import { type GalleryImage } from './image-gallery';

export const galleryPool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export const getGalleryBatch = async (offset: number) => {
	const result = await galleryPool.query<Omit<GalleryImage, 'created_at'> & { created_at: Date | null }>(
		'SELECT id, prompt, media_type, created_at FROM generated_images ORDER BY created_at DESC NULLS LAST, id DESC LIMIT 25 OFFSET $1',
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
