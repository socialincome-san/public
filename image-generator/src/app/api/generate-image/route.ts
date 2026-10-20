import { buildPrompt } from '@/app/style-template';
import { saveImage } from '@/lib/database';
import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from '@/lib/image-formats';
import { generateImage } from 'ai';
import sharp from 'sharp';

export const POST = async (request: Request) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorResponse('Please enter a prompt.', 400);
	}
	if (typeof body !== 'object' || body === null || !('prompt' in body) || typeof body.prompt !== 'string') {
		return errorResponse('Please enter a prompt.', 400);
	}
	const text = body.prompt.trim();
	if (!text) return errorResponse('Please enter a prompt.', 400);
	const aspectRatio = 'aspectRatio' in body ? body.aspectRatio : DEFAULT_IMAGE_FORMAT.value;
	const format = IMAGE_FORMATS.find((item) => item.value === aspectRatio);
	if (!format) return errorResponse('Unsupported aspect ratio', 400);

	try {
		const prompt = buildPrompt(text);
		const { image } = await generateImage({
			model: 'openai/gpt-image-2.5-flare',
			prompt,
			// OpenAI accepts custom pixel sizes rather than the SDK's aspectRatio option.
			size: `${format.width}x${format.height}`,
			providerOptions: { openai: { quality: 'high' } },
		});
		const { width, height } = await sharp(image.uint8Array).metadata();
		if (!width || !height || width * format.height !== height * format.width) {
			return errorResponse('The image provider did not return the selected format. Please try again.', 502);
		}
		await saveImage(prompt, image);
		return Response.json({ error: null, imageBase64: image.base64, mediaType: image.mediaType, width, height });
	} catch (error) {
		console.error('Image generation failed', error);
		return errorResponse('Image generation failed', 500);
	}
};

const errorResponse = (error: string, status: number) =>
	Response.json({ error, imageBase64: null, mediaType: null, width: null, height: null }, { status });
