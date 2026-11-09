import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries';
import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from '@/lib/image-formats';
import { generateAndSaveImage, handleImageRequest, imageErrorResponse } from '@/lib/image-generation';
import { buildGeneratePrompt } from '@/lib/prompts';
import { MAX_REFERENCE_IMAGE_BYTES, REFERENCE_IMAGE_TYPES } from '@/lib/reference-image';
import { pickStyleReferences } from '@/lib/style-references';
import sharp from 'sharp';

export const POST = (request: Request) =>
	handleImageRequest(async () => {
		const body = await request.formData().catch(() => null);
		const prompt = body?.get('prompt');
		const subject = typeof prompt === 'string' ? prompt.trim() : '';
		if (!body || !subject) return imageErrorResponse('Please enter a prompt.', 400);

		const aspectRatio = body.get('aspectRatio') ?? DEFAULT_IMAGE_FORMAT.value;
		const format = IMAGE_FORMATS.find((item) => item.value === aspectRatio);
		if (!format) return imageErrorResponse('Unsupported aspect ratio.', 400);

		const countryValue = body.get('country') ?? DEFAULT_COUNTRY.value;
		const country = COUNTRIES.find((item) => item.value === countryValue);
		if (!country) return imageErrorResponse('Unsupported country.', 400);

		const reference = await readReferenceImage(body.get('referenceImage'));
		if ('error' in reference) return imageErrorResponse(reference.error, reference.status);

		const styleReferences = await pickStyleReferences(country.styleReferences);
		return generateAndSaveImage({
			prompt: buildGeneratePrompt({ subject, setting: country.setting, hasUserReference: reference.bytes !== null }),
			// The user's reference goes first, as the prompt refers to it as the first image.
			images: reference.bytes ? [reference.bytes, ...styleReferences] : styleReferences,
			width: format.width,
			height: format.height,
		});
	});

type ReferenceImage = { bytes: Uint8Array | null } | { error: string; status: number };

const readReferenceImage = async (reference: FormDataEntryValue | null): Promise<ReferenceImage> => {
	if (reference === null || (reference instanceof File && reference.size === 0)) return { bytes: null };
	if (!(reference instanceof File)) return { error: 'Invalid reference image.', status: 400 };
	if (reference.size > MAX_REFERENCE_IMAGE_BYTES) return { error: 'Reference image must be 10 MB or smaller.', status: 413 };
	if (!REFERENCE_IMAGE_TYPES.includes(reference.type)) {
		return { error: 'Choose a JPEG, PNG or WebP reference image.', status: 400 };
	}
	try {
		const input = sharp(await reference.arrayBuffer(), { limitInputPixels: 40_000_000 });
		const metadata = await input.metadata();
		if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1) !== 1) {
			return { error: 'Choose a non-animated JPEG, PNG or WebP reference image.', status: 400 };
		}
		// Normalize orientation and strip photo metadata before sending to the provider.
		return { bytes: await input.rotate().png().toBuffer() };
	} catch {
		return { error: 'Reference image could not be read. Choose a valid image up to 40 megapixels.', status: 400 };
	}
};
