'use server';

import { fal } from '@fal-ai/client';
import { isSessionValid } from './session';
import { buildPrompt } from './style-template';

type GenerateResult = {
	imageUrl: string | null;
	error: string | null;
};
type FalImageResponse = {
	images: { url: string }[];
};

export async function generateImage(prevState: GenerateResult, formData: FormData): Promise<GenerateResult> {
	const authenticated = await isSessionValid();
	if (!authenticated) {
		return { error: 'Unauthorized', imageUrl: null };
	}
	const prompt = formData.get('prompt');
	if (typeof prompt !== 'string') {
		return { error: 'Missing Prompt', imageUrl: null };
	}
	if (prompt.trim() === '') {
		return { error: 'Cant send without text', imageUrl: null };
	}
	const fullPrompt = buildPrompt(prompt);
	const falKey = process.env.FAL_KEY;
	if (!falKey) {
		return { error: 'App is not configured', imageUrl: null };
	}
	try {
		const result = await fal.subscribe('openai/gpt-image-2.5/flare/text-to-image', {
			input: {
				prompt: fullPrompt,
				image_size: 'landscape_16_9',
				quality: 'high',
				num_images: 1,
				output_format: 'png',
				sync_mode: false,
			},
		});
		const data = result.data as FalImageResponse;

		const imageUrl = data.images[0].url;

		return { error: null, imageUrl };
	} catch {
		return { error: 'Image generation failed', imageUrl: null };
	}
}
