import 'server-only';

import { generateImage } from 'ai';
import sharp from 'sharp';
import { saveImage } from './database';
import { getGenerationCost } from './image-cost';
import { type ImageResponse } from './images';

// Sunburst follows the style references and accent colors more closely than Flare.
const IMAGE_MODEL = 'openai/gpt-image-2.5-sunburst';

export const imageErrorResponse = (error: string, status: number) =>
	Response.json({ error } satisfies ImageResponse, { status });

/** Wraps a generate or edit route, so any unexpected failure is logged and answered in the shape the client reads. */
export const handleImageRequest = async (handler: () => Promise<Response>) => {
	try {
		return await handler();
	} catch (error) {
		console.error('Image request failed', error);
		return imageErrorResponse('Image generation failed. Please try again.', 500);
	}
};

/** Generates an image in exactly the requested size and saves it to the gallery. */
export const generateAndSaveImage = async ({
	prompt,
	images,
	width,
	height,
}: {
	prompt: string;
	images: Uint8Array[];
	width: number;
	height: number;
}): Promise<Response> => {
	const { image, calls } = await generateImage({
		model: IMAGE_MODEL,
		prompt: { text: prompt, images },
		// OpenAI accepts custom pixel sizes rather than the SDK's aspectRatio option.
		size: `${width}x${height}`,
		providerOptions: { openai: { quality: 'high' } },
	});
	const metadata = await sharp(image.uint8Array).metadata();
	if (metadata.width !== width || metadata.height !== height) {
		return imageErrorResponse('The image provider did not return the selected format. Please try again.', 502);
	}
	const saved = await saveImage(prompt, image, getGenerationCost(calls));

	return Response.json({ image: { ...saved, width, height } } satisfies ImageResponse);
};
