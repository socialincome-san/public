import { getStoredImage } from '@/lib/database';
import { generateAndSaveImage } from '@/lib/image-generation';
import sharp from 'sharp';
import { POST } from './route';

jest.mock('server-only', () => ({}));
jest.mock('ai', () => ({ generateImage: jest.fn() }));
jest.mock('@/lib/database', () => ({ getStoredImage: jest.fn() }));
jest.mock('@/lib/image-generation', () => ({
	...jest.requireActual<typeof import('@/lib/image-generation')>('@/lib/image-generation'),
	generateAndSaveImage: jest.fn(),
}));

const imageUrl = 'https://test.public.blob.vercel-storage.com/images/original.png';
const request = () =>
	new Request('http://localhost/api/edit-image', {
		method: 'POST',
		body: JSON.stringify({ imageId: '1', comments: [{ x: 0.5, y: 0.5, text: 'Make the bag yellow' }] }),
		headers: { 'Content-Type': 'application/json' },
	});

beforeEach(() => {
	jest.resetAllMocks();
	jest.mocked(getStoredImage).mockResolvedValue({ imageUrl, media_type: 'image/png' });
});

afterEach(() => jest.restoreAllMocks());

test('fetches the Blob original and passes it to shared generation without changing its size', async () => {
	const original = await sharp({ create: { width: 32, height: 16, channels: 3, background: '#ffffff' } })
		.png()
		.toBuffer();
	const fetchImage = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(original));
	const savedResponse = Response.json({
		image: { id: '2', imageUrl: 'https://test.public.blob.vercel-storage.com/images/edited.png' },
	});
	jest.mocked(generateAndSaveImage).mockResolvedValueOnce(savedResponse);
	await expect(POST(request())).resolves.toBe(savedResponse);
	expect(fetchImage).toHaveBeenCalledWith(imageUrl);
	expect(generateAndSaveImage).toHaveBeenCalledWith({
		prompt: expect.stringContaining('Make the bag yellow'),
		images: [expect.any(Buffer)],
		width: 32,
		height: 16,
	});
});

test('does not generate another image when the Blob original cannot be loaded', async () => {
	jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('Missing', { status: 404 }));
	const response = await POST(request());
	expect(response.status).toBe(502);
	expect(await response.json()).toEqual({ error: 'Image could not be loaded.' });
	expect(generateAndSaveImage).not.toHaveBeenCalled();
});
