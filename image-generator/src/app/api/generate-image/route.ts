import { buildPrompt } from '@/app/style-template';
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries';
import { saveImage } from '@/lib/database';
import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from '@/lib/image-formats';
import { MAX_REFERENCE_IMAGE_BYTES, REFERENCE_IMAGE_TYPES } from '@/lib/reference-image';
import { getSceneReferences } from '@/lib/style-references';
import { generateImage } from 'ai';
import sharp from 'sharp';

export const POST = async (request: Request) => {
	let body: FormData;
	try {
		body = await request.formData();
	} catch {
		return errorResponse('Please enter a prompt.', 400);
	}
	const textPrompt = body.get('prompt');
	if (typeof textPrompt !== 'string') {
		return errorResponse('Please enter a prompt.', 400);
	}
	const text = textPrompt.trim();
	if (!text) return errorResponse('Please enter a prompt.', 400);
	const aspectRatio = body.get('aspectRatio') ?? DEFAULT_IMAGE_FORMAT.value;
	const format = IMAGE_FORMATS.find((item) => item.value === aspectRatio);
	if (!format) return errorResponse('Unsupported aspect ratio', 400);
	const countryValue = body.get('country') ?? DEFAULT_COUNTRY.value;
	const country = COUNTRIES.find((item) => item.value === countryValue);
	if (!country) return errorResponse('Unsupported country', 400);
	const reference = body.get('referenceImage');
	let referenceBytes: Uint8Array | undefined;
	if (reference !== null && !(reference instanceof File)) {
		return errorResponse('Invalid reference image.', 400);
	}
	if (reference instanceof File && reference.size > 0) {
		if (reference.size > MAX_REFERENCE_IMAGE_BYTES) {
			return errorResponse('Reference image must be 10 MB or smaller.', 413);
		}
		if (!REFERENCE_IMAGE_TYPES.includes(reference.type)) {
			return errorResponse('Choose a JPEG, PNG or WebP reference image.', 400);
		}
		try {
			const input = sharp(await reference.arrayBuffer(), { limitInputPixels: 40_000_000 });
			const metadata = await input.metadata();
			if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1) !== 1) {
				return errorResponse('Choose a non-animated JPEG, PNG or WebP reference image.', 400);
			}
			// Normalize orientation and strip photo metadata before sending to the provider.
			referenceBytes = await input.rotate().png().toBuffer();
		} catch {
			return errorResponse('Reference image could not be read. Choose a valid image up to 40 megapixels.', 400);
		}
	}

	try {
		const prompt = buildPrompt(text, country.setting, referenceBytes !== undefined);
		const styleReferences = await getSceneReferences(country.value);
		const { image } = await generateImage({
			// Sunburst follows the style references and accent colors more closely than Flare.
			model: 'openai/gpt-image-2.5-sunburst',
			prompt: { text: prompt, images: referenceBytes ? [referenceBytes, ...styleReferences] : styleReferences },
			// OpenAI accepts custom pixel sizes rather than the SDK's aspectRatio option.
			size: `${format.width}x${format.height}`,
			providerOptions: { openai: { quality: 'high' } },
		});
		const { width, height } = await sharp(image.uint8Array).metadata();
		if (width !== format.width || height !== format.height) {
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
