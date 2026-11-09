import { DatabaseError } from 'pg';

const mockQuery = jest.fn();
const mockUpload = jest.fn();
const mockDelete = jest.fn();
let onEnd = () => {};

jest.mock('pg', () => ({
	...jest.requireActual<typeof import('pg')>('pg'),
	Pool: jest.fn(() => ({ query: (...args: unknown[]) => mockQuery(...args), end: () => onEnd() })),
}));
jest.mock('server-only', () => ({}));
jest.mock('../src/lib/image-storage', () => ({
	uploadImage: (...args: unknown[]) => mockUpload(...args),
	deleteStoredImages: (...args: unknown[]) => mockDelete(...args),
}));

const stored = {
	imageUrl: 'https://test.public.blob.vercel-storage.com/images/original.png',
	previewUrl: 'https://test.public.blob.vercel-storage.com/previews/preview.webp',
};
const legacy = (id: string) => ({ id, image_base64: 'AQID', media_type: 'image/png' });
const originalDatabaseUrl = process.env.DATABASE_URL;
const originalToken = process.env.BLOB_READ_WRITE_TOKEN;
const originalExitCode = process.exitCode;

beforeEach(() => {
	jest.clearAllMocks();
	mockQuery.mockReset();
	mockUpload.mockReset();
	mockDelete.mockReset();
	process.env.DATABASE_URL = 'postgres://test';
	process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
	process.exitCode = undefined;
	mockUpload.mockResolvedValue(stored);
	mockDelete.mockResolvedValue(undefined);
	jest.spyOn(console, 'log').mockImplementation(() => {});
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
	else process.env.DATABASE_URL = originalDatabaseUrl;
	if (originalToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
	else process.env.BLOB_READ_WRITE_TOKEN = originalToken;
	process.exitCode = originalExitCode;
	jest.restoreAllMocks();
});

const runMigration = async () => {
	const finished = new Promise<void>((resolve) => {
		onEnd = resolve;
	});
	await jest.isolateModulesAsync(async () => {
		await import('./migrate-images-to-blob');
		await finished;
	});
};

test('migrates in small batches with a cursor and retains Base64 for verification', async () => {
	mockQuery
		.mockResolvedValueOnce({ rows: [legacy('1'), legacy('10')] })
		.mockResolvedValueOnce({ rowCount: 1 })
		.mockResolvedValueOnce({ rowCount: 1 })
		.mockResolvedValueOnce({ rows: [legacy('2')] })
		.mockResolvedValueOnce({ rowCount: 1 })
		.mockResolvedValueOnce({ rows: [] });
	await runMigration();
	expect(mockQuery).toHaveBeenNthCalledWith(
		1,
		expect.stringContaining('image_url IS NULL AND id::text > $1 ORDER BY id::text LIMIT 10'),
		[''],
	);
	expect(mockQuery).toHaveBeenNthCalledWith(4, expect.any(String), ['10']);
	expect(mockQuery).toHaveBeenNthCalledWith(6, expect.any(String), ['2']);
	expect(mockUpload).toHaveBeenCalledWith({ uint8Array: Buffer.from([1, 2, 3]), mediaType: 'image/png' });
	expect(mockQuery).toHaveBeenNthCalledWith(
		2,
		'UPDATE generated_images SET image_url = $1, preview_url = $2 WHERE id = $3 AND image_url IS NULL',
		[stored.imageUrl, stored.previewUrl, '1'],
	);
	expect(console.log).toHaveBeenCalledWith('Migrated: 3. Failed: 0.');
	expect(mockDelete).not.toHaveBeenCalled();
});

test('a rerun with no unmigrated images does not upload anything', async () => {
	mockQuery.mockResolvedValueOnce({ rows: [] });
	await runMigration();
	expect(mockUpload).not.toHaveBeenCalled();
	expect(console.log).toHaveBeenCalledWith('Migrated: 0. Failed: 0.');
});

test('cleans up failed updates, continues past failures, and reports failed IDs', async () => {
	mockQuery
		.mockResolvedValueOnce({ rows: [legacy('1'), legacy('2'), legacy('3')] })
		.mockRejectedValueOnce(Object.assign(new DatabaseError('Update failed', 0, 'error'), { code: '23505' }))
		.mockResolvedValueOnce({ rowCount: 1 })
		.mockResolvedValueOnce({ rows: [] });
	mockUpload.mockRejectedValueOnce(new Error('Upload failed')).mockResolvedValue(stored);
	await runMigration();
	expect(mockDelete).toHaveBeenCalledWith(stored);
	expect(mockQuery).toHaveBeenLastCalledWith(expect.any(String), ['3']);
	expect(console.log).toHaveBeenCalledWith('Migrated: 1. Failed: 2.');
	expect(console.error).toHaveBeenCalledWith('Failed image ids:', '1, 2');
	expect(process.exitCode).toBe(1);
});

test('removes redundant uploads when another run has already migrated a row', async () => {
	mockQuery
		.mockResolvedValueOnce({ rows: [legacy('1')] })
		.mockResolvedValueOnce({ rowCount: 0 })
		.mockResolvedValueOnce({ rows: [] });
	await runMigration();
	expect(mockDelete).toHaveBeenCalledWith(stored);
	expect(console.log).toHaveBeenCalledWith('Migrated: 0. Failed: 0.');
});

test('does not retry deletion when redundant-upload cleanup fails', async () => {
	mockQuery
		.mockResolvedValueOnce({ rows: [legacy('1')] })
		.mockResolvedValueOnce({ rowCount: 0 })
		.mockResolvedValueOnce({ rows: [] });
	mockDelete.mockRejectedValueOnce(new Error('Cleanup failed'));
	await runMigration();
	expect(mockDelete).toHaveBeenCalledTimes(1);
	expect(console.error).toHaveBeenCalledWith('Failed to remove redundant images', stored, expect.any(Error));
	expect(console.log).toHaveBeenCalledWith('Migrated: 0. Failed: 1.');
	expect(process.exitCode).toBe(1);
});

test.each([
	new Error('Connection lost'),
	Object.assign(new DatabaseError('Statement completion unknown', 0, 'error'), { code: '40003' }),
])('retains blobs when an update outcome is uncertain: %s', async (error) => {
	mockQuery
		.mockResolvedValueOnce({ rows: [legacy('1')] })
		.mockRejectedValueOnce(error)
		.mockResolvedValueOnce({ rows: [] });
	await runMigration();
	expect(mockDelete).not.toHaveBeenCalled();
	expect(console.error).toHaveBeenCalledWith('Image update outcome unknown; retained blobs for verification', stored, error);
	expect(console.log).toHaveBeenCalledWith('Migrated: 0. Failed: 1.');
	expect(process.exitCode).toBe(1);
});
