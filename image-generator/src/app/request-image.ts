import { isImageResponse, type ImageResponse } from '@/lib/images';

/** Calls the generate or edit route. Network and server failures come back as an error message, never thrown. */
export const requestImage = async (url: string, body: FormData | string): Promise<ImageResponse> => {
	try {
		const response = await fetch(url, {
			method: 'POST',
			body,
			headers: typeof body === 'string' ? { 'Content-Type': 'application/json' } : undefined,
		});
		const json: unknown = await response.json();
		if (isImageResponse(json)) return json;
	} catch {
		// Falls through to the generic message.
	}
	return { error: 'Image generation failed. Please try again.' };
};
