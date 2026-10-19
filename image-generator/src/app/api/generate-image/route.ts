import { buildPrompt } from '@/app/style-template';
import { saveImage } from '@/lib/database';
import { generateImage } from 'ai';

export const POST = async (request: Request) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorResponse('Missing Prompt', 400);
	}
	if (typeof body !== 'object' || body === null || !('prompt' in body) || typeof body.prompt !== 'string') {
		return errorResponse('Missing Prompt', 400);
	}
	const text = body.prompt.trim();
	if (!text) return errorResponse('Cant send without text', 400);

	try {
		const prompt = buildPrompt(text);
		const { image } = await generateImage({
			model: 'openai/gpt-image-2.5-flare',
			prompt,
			aspectRatio: '16:9',
			providerOptions: { openai: { quality: 'high' } },
		});
		await saveImage(prompt, image);
		return Response.json({ error: null, imageBase64: image.base64, mediaType: image.mediaType });
	} catch (error) {
		console.error('Image generation failed', error);
		return errorResponse('Image generation failed', 500);
	}
};

const errorResponse = (error: string, status: number) =>
	Response.json({ error, imageBase64: null, mediaType: null }, { status });
