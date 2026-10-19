import { getStoredImage } from '@/lib/database';
import sharp from 'sharp';

const cacheHeaders = {
	'Cache-Control': 'private, max-age=86400',
	'X-Content-Type-Options': 'nosniff',
};

export const GET = async (request: Request, { params }: RouteContext<'/api/gallery-images/[id]'>) => {
	const { id } = await params;
	if (!/^[1-9][0-9]{0,18}$/.test(id) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
		return new Response('Image not found', { status: 404 });
	}

	try {
		const download = new URL(request.url).searchParams.get('download') === '1';
		const image = await getStoredImage(id);
		if (!image) return new Response('Image not found', { status: 404 });
		if (!['image/png', 'image/jpeg', 'image/webp'].includes(image.media_type)) {
			return new Response('Unsupported image format', { status: 415 });
		}
		const original = Buffer.from(image.image_base64, 'base64');

		if (download) {
			const extension = image.media_type === 'image/jpeg' ? 'jpg' : image.media_type === 'image/webp' ? 'webp' : 'png';
			return new Response(new Uint8Array(original), {
				headers: {
					...cacheHeaders,
					'Content-Type': image.media_type,
					'Content-Disposition': `attachment; filename="social-income-${id}.${extension}"`,
				},
			});
		}

		const preview = await sharp(original)
			.rotate()
			.resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 75 })
			.toBuffer();
		return new Response(new Uint8Array(preview), {
			headers: { ...cacheHeaders, 'Content-Type': 'image/webp' },
		});
	} catch (error) {
		console.error('Gallery image loading failed', error);
		return new Response('Image could not be loaded', { status: 500 });
	}
};
