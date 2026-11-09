import { Pool } from 'pg';
import { isConfirmedWriteFailure } from '../src/lib/database-errors';
import { deleteStoredImages, uploadImage } from '../src/lib/image-storage';

type LegacyImage = { id: string; image_base64: string | null; media_type: string };

const migrate = async () => {
	if (!process.env.DATABASE_URL || !process.env.BLOB_READ_WRITE_TOKEN) {
		throw new Error('DATABASE_URL and BLOB_READ_WRITE_TOKEN must be configured');
	}
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	let cursor = '';
	let migrated = 0;
	const failed: string[] = [];
	try {
		while (true) {
			// Text ordering works for both numeric and UUID ids, including failed rows on the next run.
			const batch = await pool.query<LegacyImage>(
				'SELECT id::text AS id, image_base64, media_type FROM generated_images WHERE image_url IS NULL AND id::text > $1 ORDER BY id::text LIMIT 10',
				[cursor],
			);
			if (batch.rows.length === 0) break;
			for (const image of batch.rows) {
				cursor = image.id;
				try {
					if (!image.image_base64) throw new Error('No original image data');
					const stored = await uploadImage({
						uint8Array: Buffer.from(image.image_base64, 'base64'),
						mediaType: image.media_type,
					});
					let updated: { rowCount: number | null };
					try {
						updated = await pool.query(
							'UPDATE generated_images SET image_url = $1, preview_url = $2 WHERE id = $3 AND image_url IS NULL',
							[stored.imageUrl, stored.previewUrl, image.id],
						);
					} catch (error) {
						if (isConfirmedWriteFailure(error)) {
							try {
								await deleteStoredImages(stored);
							} catch (cleanupError) {
								console.error('Failed to remove orphaned images', stored, cleanupError);
							}
						} else {
							console.error('Image update outcome unknown; retained blobs for verification', stored, error);
						}
						throw error;
					}
					if (updated.rowCount === 0) {
						try {
							await deleteStoredImages(stored);
						} catch (cleanupError) {
							console.error('Failed to remove redundant images', stored, cleanupError);
							throw cleanupError;
						}
					} else {
						migrated++;
						console.log(`Migrated image ${image.id}`);
					}
				} catch (error) {
					failed.push(image.id);
					console.error(`Image ${image.id} failed`, error);
				}
			}
		}
	} finally {
		await pool.end();
		console.log(`Migrated: ${migrated}. Failed: ${failed.length}.`);
		if (failed.length) console.error('Failed image ids:', failed.join(', '));
	}
	if (failed.length) process.exitCode = 1;
};

migrate().catch((error: unknown) => {
	console.error('Image migration failed', error);
	process.exitCode = 1;
});
