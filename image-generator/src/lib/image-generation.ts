import 'server-only';

import { generateImage } from 'ai';
import sharp from 'sharp';
import { saveImage } from './database';
import { type ImageResponse } from './images';

// Sunburst follows the style references and accent colors more closely than Flare.
const IMAGE_MODEL = 'openai/gpt-image-2.5-sunburst';

export const imageErrorResponse = (error: string, status: number) =>
	Response.json({ error } satisfies ImageResponse, { status });

/** Generates an image in exactly the requested size, saves it to the gallery and answers the request. */
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
	try {
		const { image } = await generateImage({
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
		const id = await saveImage(prompt, image);

		return Response.json({ image: { id, width, height } } satisfies ImageResponse);
	} catch (error) {
		console.error('Image generation failed', error);

		return imageErrorResponse('Image generation failed. Please try again.', 500);
	}
};
