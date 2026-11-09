import { getGalleryBatch } from '@/lib/database';
import { isImageId } from '@/lib/images';

export const GET = async (request: Request) => {
	const after = new URL(request.url).searchParams.get('after');
	if (!isImageId(after)) {
		return Response.json({ error: 'Invalid request.' }, { status: 400 });
	}

	try {
		return Response.json(await getGalleryBatch(after), {
			headers: { 'Cache-Control': 'private, no-store' },
		});
	} catch (error) {
		console.error('Loading more gallery images failed', error);
		return Response.json({ error: 'Images could not be loaded. Please try again.' }, { status: 500 });
	}
};
