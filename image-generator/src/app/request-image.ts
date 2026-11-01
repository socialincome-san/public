import { isImageResponse, type ImageResponse } from '@/lib/images';

/** Calls the generate or edit route. Network and server failures come back as an error message, never thrown. */
export const requestImage = async (url: string, body: FormData | string): Promise<ImageResponse> => {
	const json: unknown = await fetch(url, {
		method: 'POST',
		body,
		headers: typeof body === 'string' ? { 'Content-Type': 'application/json' } : undefined,
	})
		.then((response) => response.json())
		.catch(() => null);

	return isImageResponse(json) ? json : { error: 'Image generation failed. Please try again.' };
};
