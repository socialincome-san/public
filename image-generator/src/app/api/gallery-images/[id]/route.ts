import { deleteImage, getStoredImage } from '@/lib/database';
import { isImageId, isImageVariant } from '@/lib/images';
import { removePaperBackgroundInWorker } from '@/lib/paper-cutout-in-worker';
import sharp from 'sharp';

const cacheHeaders = {
	'Cache-Control': 'private, max-age=86400',
	'X-Content-Type-Options': 'nosniff',
};

const EXTENSIONS: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/**
 * `?variant=preview` (default) an 800px WebP, `original` the stored image, `transparent` a PNG without the white
 * paper. `&download=1` serves it as an attachment.
 */
export const GET = async (request: Request, { params }: RouteContext<'/api/gallery-images/[id]'>) => {
	const { id } = await params;
	if (!isImageId(id)) return new Response('Image not found', { status: 404 });

	const { searchParams } = new URL(request.url);
	const variant = searchParams.get('variant') ?? 'preview';
	if (!isImageVariant(variant)) return new Response('Unknown variant', { status: 400 });
	const download = searchParams.get('download') === '1';

	try {
		const image = await getStoredImage(id);
		if (!image) return new Response('Image not found', { status: 404 });
		const extension = EXTENSIONS[image.media_type];
		if (!extension) return new Response('Unsupported image format', { status: 415 });
		const original = Buffer.from(image.image_base64, 'base64');

		const respond = (body: Buffer, contentType: string, filename: string) =>
			new Response(new Uint8Array(body), {
				headers: {
					...cacheHeaders,
					'Content-Type': contentType,
					'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
				},
			});

		switch (variant) {
			case 'original':
				return respond(original, image.media_type, `social-income-${id}.${extension}`);
			case 'transparent':
				return respond(await removePaperBackgroundInWorker(original), 'image/png', `social-income-${id}-transparent.png`);
			case 'preview': {
				const preview = await sharp(original)
					.rotate()
					.resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
					.webp({ quality: 75 })
					.toBuffer();
				return respond(preview, 'image/webp', `social-income-${id}.webp`);
			}
		}
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
