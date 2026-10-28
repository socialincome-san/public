import { deleteImage, getStoredImage } from '@/lib/database';
import { isImageId } from '@/lib/images';
import { removePaperBackgroundInWorker } from '@/lib/paper-cutout-in-worker';

const cacheHeaders = {
	'Cache-Control': 'private, max-age=86400',
	'X-Content-Type-Options': 'nosniff',
};

export const GET = async (request: Request, { params }: RouteContext<'/api/gallery-images/[id]'>) => {
	const { id } = await params;
	if (!isImageId(id)) return new Response('Image not found', { status: 404 });

	const { searchParams } = new URL(request.url);
	if (searchParams.get('variant') !== 'transparent') return new Response('Unknown variant', { status: 400 });
	const download = searchParams.get('download') === '1';

	try {
		const image = await getStoredImage(id);
		if (!image) return new Response('Image not found', { status: 404 });
		if (!['image/png', 'image/jpeg', 'image/webp'].includes(image.media_type)) {
			return new Response('Unsupported image format', { status: 415 });
		}
		const response = await fetch(image.imageUrl);
		if (!response.ok) return new Response('Image could not be loaded', { status: 502 });
		const original = Buffer.from(await response.arrayBuffer());
		const transparent = await removePaperBackgroundInWorker(original);
		return new Response(new Uint8Array(transparent), {
			headers: {
				...cacheHeaders,
				'Content-Type': 'image/png',
				'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="social-income-${id}-transparent.png"`,
			},
		});
	} catch (error) {
		console.error('Gallery image loading failed', error);
		return new Response('Image could not be loaded', { status: 500 });
	}
};

export const DELETE = async (_request: Request, { params }: RouteContext<'/api/gallery-images/[id]'>) => {
	const { id } = await params;
	if (!isImageId(id)) return Response.json({ error: 'Image not found.' }, { status: 404 });

	try {
		if (!(await deleteImage(id))) return Response.json({ error: 'Image not found.' }, { status: 404 });
		return new Response(null, { status: 204 });
	} catch (error) {
		console.error('Deleting gallery image failed', error);
		return Response.json({ error: 'Image could not be deleted. Please try again.' }, { status: 500 });
	}
};
