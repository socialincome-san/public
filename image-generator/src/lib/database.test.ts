import { DatabaseError } from 'pg';
import { getGalleryBatch, saveImage } from './database';
import { deleteStoredImages, uploadImage } from './image-storage';

const mockQuery = jest.fn();

jest.mock('server-only', () => ({}));
jest.mock('pg', () => ({
	...jest.requireActual<typeof import('pg')>('pg'),
	Pool: jest.fn(() => ({ query: (...args: unknown[]) => mockQuery(...args) })),
}));
jest.mock('./image-storage', () => ({ uploadImage: jest.fn(), deleteStoredImages: jest.fn() }));

const stored = {
	imageUrl: 'https://test.public.blob.vercel-storage.com/images/original.png',
	previewUrl: 'https://test.public.blob.vercel-storage.com/previews/preview.webp',
};
const image = { uint8Array: new Uint8Array([1, 2, 3]), mediaType: 'image/png' };

beforeEach(() => {
	jest.resetAllMocks();
	jest.mocked(uploadImage).mockResolvedValue(stored);
	jest.mocked(deleteStoredImages).mockResolvedValue(undefined);
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('saves only URLs and metadata and returns the uploaded URLs', async () => {
	await expect(saveImage('A watercolor', image)).resolves.toEqual(stored);
	expect(uploadImage).toHaveBeenCalledWith(image);
	expect(mockQuery).toHaveBeenCalledWith(
		'INSERT INTO generated_images (prompt, image_url, preview_url, media_type) VALUES ($1, $2, $3, $4)',
		['A watercolor', stored.imageUrl, stored.previewUrl, 'image/png'],
	);
	expect(deleteStoredImages).not.toHaveBeenCalled();
});

test('removes both blobs if PostgreSQL rejects the insert', async () => {
	mockQuery.mockRejectedValueOnce(Object.assign(new DatabaseError('Insert failed', 0, 'error'), { code: '23505' }));
	await expect(saveImage('A watercolor', image)).rejects.toThrow('Insert failed');
	expect(deleteStoredImages).toHaveBeenCalledWith(stored);
});

test('preserves the insert error and logs orphan URLs if cleanup fails', async () => {
	const log = jest.spyOn(console, 'error').mockImplementation(() => {});
	mockQuery.mockRejectedValueOnce(Object.assign(new DatabaseError('Insert failed', 0, 'error'), { code: '23505' }));
	jest.mocked(deleteStoredImages).mockRejectedValueOnce(new Error('Cleanup failed'));
	try {
		await expect(saveImage('A watercolor', image)).rejects.toThrow('Insert failed');
		expect(log).toHaveBeenCalledWith('Failed to remove orphaned images', stored, expect.any(Error));
	} finally {
		log.mockRestore();
	}
});

test('retains blobs when a connection error leaves the insert outcome unknown', async () => {
	const error = new Error('Connection lost');
	mockQuery.mockRejectedValueOnce(error);
	await expect(saveImage('A watercolor', image)).rejects.toThrow('Connection lost');
	expect(deleteStoredImages).not.toHaveBeenCalled();
	expect(console.error).toHaveBeenCalledWith('Image insert outcome unknown; retained blobs for verification', stored, error);
});

test.each(['08006', '08007', '40003', '57014'])(
	'does not treat SQLSTATE %s as a confirmed write rejection',
	async (code) => {
		mockQuery.mockRejectedValueOnce(Object.assign(new DatabaseError('Outcome unknown', 0, 'error'), { code }));
		await expect(saveImage('A watercolor', image)).rejects.toThrow('Outcome unknown');
		expect(deleteStoredImages).not.toHaveBeenCalled();
	},
);

test('does not insert if uploading fails', async () => {
	jest.mocked(uploadImage).mockRejectedValueOnce(new Error('Upload failed'));
	await expect(saveImage('A watercolor', image)).rejects.toThrow('Upload failed');
	expect(mockQuery).not.toHaveBeenCalled();
});

test('paginates metadata and URLs without selecting Base64', async () => {
	const created = new Date('2026-10-28T12:00:00Z');
	mockQuery.mockResolvedValueOnce({
		rows: Array.from({ length: 25 }, (_, index) => ({
			id: index + 1,
			prompt: null,
			media_type: 'image/png',
			created_at: index === 0 ? null : created,
			...stored,
		})),
	});
	const batch = await getGalleryBatch(24);
	expect(batch.hasMore).toBe(true);
	expect(batch.images).toHaveLength(24);
	expect(batch.images[0]).toMatchObject({ ...stored, created_at: null });
	expect(batch.images[1]?.created_at).toBe(created.toISOString());
	expect(mockQuery).toHaveBeenCalledWith(expect.not.stringContaining('image_base64'), [24]);
	expect(mockQuery).toHaveBeenCalledWith(
		expect.stringContaining('WHERE image_url IS NOT NULL AND preview_url IS NOT NULL'),
		[24],
	);
});
