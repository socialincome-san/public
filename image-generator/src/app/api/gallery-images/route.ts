import { getGalleryBatch } from '@/lib/database';

export const GET = async (request: Request) => {
	const value = new URL(request.url).searchParams.get('offset') ?? '0';
	const offset = Number(value);
	if (!/^\d+$/.test(value) || !Number.isSafeInteger(offset) || offset > 1000000) {
		return Response.json({ error: 'Invalid request.' }, { status: 400 });
	}

	try {
		return Response.json(await getGalleryBatch(offset), {
			headers: { 'Cache-Control': 'private, no-store' },
		});
	} catch (error) {
		console.error('Loading more gallery images failed', error);
		return Response.json({ error: 'Images could not be loaded. Please try again.' }, { status: 500 });
	}
};
