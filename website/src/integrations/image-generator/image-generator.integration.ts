import 'server-only';

import { resultFail, resultOk, type Result } from '@/lib/result';
import { z } from 'zod';

const BLOB_HOSTNAME = 'jjjjivv3brvymvql.public.blob.vercel-storage.com';
const REQUEST_TIMEOUT_MS = 10_000;

const blobUrlSchema = (folder: 'images' | 'previews') =>
	z.string().refine((value) => {
		try {
			const url = new URL(value);

			return (
				url.protocol === 'https:' &&
				url.hostname === BLOB_HOSTNAME &&
				url.port === '' &&
				url.username === '' &&
				url.password === '' &&
				url.pathname.startsWith(`/${folder}/`)
			);
		} catch {
			return false;
		}
	});

const galleryImageSchema = z.object({
	id: z.union([z.string().min(1), z.number().int().positive()]),
	prompt: z.string().nullable(),
	previewUrl: blobUrlSchema('previews'),
	imageUrl: blobUrlSchema('images').nullable().default(null),
	costUsd: z.number().finite().nonnegative().nullable(),
	createdAt: z.iso.datetime().nullable().default(null),
});

const galleryResponseSchema = z.object({ images: z.array(z.unknown()) });
type GalleryImage = z.infer<typeof galleryImageSchema>;

export const fetchImageGeneratorGallery = async (): Promise<Result<GalleryImage[]>> => {
	const baseUrl = process.env.IMAGE_GENERATOR_URL;
	const password = process.env.IMAGE_GENERATOR_PASSWORD;
	if (!baseUrl || !password) {
		console.error('Image generator gallery configuration is missing', {
			missing: [!baseUrl && 'IMAGE_GENERATOR_URL', !password && 'IMAGE_GENERATOR_PASSWORD'].filter(Boolean),
		});

		return resultFail('Image generator is not configured.');
	}

	try {
		const url = new URL('/api/gallery', baseUrl);
		const isLocalHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
		if ((!isLocalHttp && url.protocol !== 'https:') || url.username || url.password) {
			console.error('Image generator gallery URL is invalid');

			return resultFail('Image generator URL is invalid.');
		}

		if (process.env.NODE_ENV === 'development') {
			console.info('Image generator gallery request', { origin: url.origin, path: url.pathname });
		}

		const response = await fetch(url, {
			headers: {
				Accept: 'application/json',
				Authorization: `Basic ${Buffer.from(':' + password).toString('base64')}`,
			},
			cache: 'no-store',
			redirect: 'error',
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});
		if (!response.ok) {
			console.error('Image generator gallery request failed', { status: response.status });
			if (response.status === 401) {
				console.error('IMAGE_GENERATOR_PASSWORD must match APP_PASSWORD on the requested image generator');
			}

			return resultFail('Image generator gallery could not be loaded.');
		}

		const payload: unknown = await response.json();
		const parsed = galleryResponseSchema.safeParse(payload);
		if (!parsed.success) {
			console.error('Image generator gallery returned an invalid response');

			return resultFail('Image generator gallery response is invalid.');
		}

		const images = parsed.data.images.flatMap((image) => {
			const parsedImage = galleryImageSchema.safeParse(image);
			if (!parsedImage.success && process.env.NODE_ENV === 'development') {
				console.warn('Image generator gallery rejected an image', {
					issues: parsedImage.error.issues.map(({ path, code }) => ({ path: path.join('.'), code })),
					expectedBlobHostname: BLOB_HOSTNAME,
				});
			}

			return parsedImage.success ? [parsedImage.data] : [];
		});
		if (images.length < parsed.data.images.length) {
			console.error('Image generator gallery skipped invalid images', {
				count: parsed.data.images.length - images.length,
			});
		}

		if (process.env.NODE_ENV === 'development') {
			console.info('Image generator gallery loaded', { received: parsed.data.images.length, accepted: images.length });
		}

		return resultOk(images);
	} catch (error) {
		console.error('Could not fetch image generator gallery', {
			errorName: error instanceof Error ? error.name : 'Unknown',
			causeCode:
				error instanceof Error &&
				error.cause instanceof Error &&
				'code' in error.cause &&
				typeof error.cause.code === 'string'
					? error.cause.code
					: undefined,
		});

		return resultFail('Image generator gallery could not be loaded.');
	}
};
