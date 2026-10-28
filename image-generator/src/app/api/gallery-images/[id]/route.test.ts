import { getStoredImage } from '@/lib/database';
import { removePaperBackgroundInWorker } from '@/lib/paper-cutout-in-worker';
import { GET } from './route';

jest.mock('server-only', () => ({}));
jest.mock('@/lib/database', () => ({ getStoredImage: jest.fn() }));
jest.mock('@/lib/paper-cutout-in-worker', () => ({ removePaperBackgroundInWorker: jest.fn() }));

const imageUrl = 'https://test.public.blob.vercel-storage.com/images/original.png';
const original = Buffer.from([1, 2, 3]);
const cutout = Buffer.from([4, 5, 6]);
const context = { params: Promise.resolve({ id: '1' }) };

beforeEach(() => {
	jest.resetAllMocks();
	jest.mocked(getStoredImage).mockResolvedValue({ imageUrl, media_type: 'image/png' });
	jest.mocked(removePaperBackgroundInWorker).mockResolvedValue(cutout);
});

afterEach(() => jest.restoreAllMocks());

test('fetches the Blob original and serves the transparent download', async () => {
	const request = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(original));
	const response = await GET(new Request('http://localhost/api/gallery-images/1?variant=transparent&download=1'), context);
	expect(request).toHaveBeenCalledWith(imageUrl);
	expect(removePaperBackgroundInWorker).toHaveBeenCalledWith(original);
	expect(response.status).toBe(200);
	expect(response.headers.get('Content-Type')).toBe('image/png');
	expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="social-income-1-transparent.png"');
	expect(Buffer.from(await response.arrayBuffer())).toEqual(cutout);
});

test.each(['preview', 'original'])('rejects the removed %s variant without loading an image', async (variant) => {
	const response = await GET(new Request(`http://localhost/api/gallery-images/1?variant=${variant}`), context);
	expect(response.status).toBe(400);
	expect(getStoredImage).not.toHaveBeenCalled();
});

test('does not process an unsuccessful Blob response', async () => {
	jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('Missing', { status: 404 }));
	const response = await GET(new Request('http://localhost/api/gallery-images/1?variant=transparent'), context);
	expect(response.status).toBe(502);
	expect(removePaperBackgroundInWorker).not.toHaveBeenCalled();
});

test('returns not found for an unmigrated or missing image', async () => {
	jest.mocked(getStoredImage).mockResolvedValueOnce(undefined);
	const request = jest.spyOn(globalThis, 'fetch');
	const response = await GET(new Request('http://localhost/api/gallery-images/1?variant=transparent'), context);
	expect(response.status).toBe(404);
	expect(request).not.toHaveBeenCalled();
});
