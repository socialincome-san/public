import 'server-only';

import { resultFail, resultOk, type Result } from '@/lib/result';
import { z } from 'zod';

const BLOB_HOSTNAME = 'jjjjivv3brvymvql.public.blob.vercel-storage.com';
const REQUEST_TIMEOUT_MS = 10_000;

const previewUrlSchema = z.string().refine((value) => {
	try {
		const url = new URL(value);

		return (
			url.protocol === 'https:' &&
			url.hostname === BLOB_HOSTNAME &&
			url.port === '' &&
			url.username === '' &&
			url.password === '' &&
			url.pathname.startsWith('/previews/')
		);
	} catch {
		return false;
	}
});

const galleryImageSchema = z.object({
	id: z.union([z.string().min(1), z.number().int().positive()]),
	prompt: z.string().nullable(),
	previewUrl: previewUrlSchema,
	costUsd: z.number().finite().nonnegative().nullable(),
});

const galleryResponseSchema = z.object({ images: z.array(galleryImageSchema) });
type GalleryImage = z.infer<typeof galleryImageSchema>;

export const fetchImageGeneratorGallery = async (): Promise<Result<GalleryImage[]>> => {
	const baseUrl = process.env.IMAGE_GENERATOR_URL;
	const password = process.env.IMAGE_GENERATOR_PASSWORD;
	if (!baseUrl || !password) {
		return resultFail('Image generator is not configured.');
	}

	try {
		const url = new URL('/api/gallery', baseUrl);
		const isLocalHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
		if ((!isLocalHttp && url.protocol !== 'https:') || url.username || url.password) {
			return resultFail('Image generator URL is invalid.');
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

			return resultFail('Image generator gallery could not be loaded.');
		}

		const payload: unknown = await response.json();
		const parsed = galleryResponseSchema.safeParse(payload);
		if (!parsed.success) {
			console.error('Image generator gallery returned an invalid response');

			return resultFail('Image generator gallery response is invalid.');
		}

		return resultOk(parsed.data.images);
	} catch (error) {
		console.error('Could not fetch image generator gallery', error);

		return resultFail('Image generator gallery could not be loaded.');
	}
};
