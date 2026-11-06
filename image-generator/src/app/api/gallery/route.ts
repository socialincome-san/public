import { getGalleryImages } from '@/lib/database';

export const GET = async () => {
	try {
		return Response.json({ images: await getGalleryImages() }, { headers: { 'Cache-Control': 'private, no-store' } });
	} catch (error) {
		console.error('Loading gallery images failed', error);
		return Response.json(
			{ error: 'Images could not be loaded. Please try again.' },
			{ status: 500, headers: { 'Cache-Control': 'private, no-store' } },
		);
	}
};
