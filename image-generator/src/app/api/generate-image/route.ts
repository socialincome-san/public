import { buildPrompt } from '@/app/style-template';
import { saveImage } from '@/lib/database';
import { MAX_COMMENT_IMAGE_BYTES } from '@/lib/image-comment-limits';
import { prepareImageComments } from '@/lib/image-comments';
import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from '@/lib/image-formats';
import { MAX_REFERENCE_IMAGE_BYTES, REFERENCE_IMAGE_TYPES } from '@/lib/reference-image';
import { generateImage } from 'ai';
import sharp from 'sharp';

const prepareReferenceImage = async (reference: FormDataEntryValue | null): Promise<Uint8Array | Response | undefined> => {
	if (reference !== null && !(reference instanceof File)) {
		return errorResponse('Invalid reference image.', 400);
	}
	if (!(reference instanceof File) || reference.size === 0) return undefined;
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
		return await input.rotate().png().toBuffer();
	} catch {
		return errorResponse('Reference image could not be read. Choose a valid image up to 40 megapixels.', 400);
	}
};

export const POST = async (request: Request) => {
	let body: FormData;
	try {
		body = await request.formData();
	} catch {
		return errorResponse('Please enter a prompt.', 400);
	}
	const textPrompt = body.get('prompt');
	const text = typeof textPrompt === 'string' ? textPrompt.trim() : '';
	const commentImage = body.get('commentImage');
	const comments = body.get('comments');
	const isEdit = commentImage !== null || comments !== null;
	let edit: Awaited<ReturnType<typeof prepareImageComments>> | undefined;
	if (isEdit) {
		if (!(commentImage instanceof File) || typeof comments !== 'string') {
			return errorResponse('Provide an original image and comments.', 400);
		}
		if (commentImage.size > MAX_COMMENT_IMAGE_BYTES) {
			return errorResponse('Image must be 20 MB or smaller.', 413);
		}
		const editReference = body.get('referenceImage');
		if (editReference instanceof File && editReference.size > 0) {
			return errorResponse('Reference images cannot be combined with image comments.', 400);
		}
		try {
			edit = await prepareImageComments(commentImage, comments);
		} catch (error) {
			return errorResponse(error instanceof Error ? error.message : 'Invalid image comments.', 400);
		}
	}
	if (!text && !edit) return errorResponse('Please enter a prompt.', 400);
	const aspectRatio = body.get('aspectRatio') ?? DEFAULT_IMAGE_FORMAT.value;
	const format = IMAGE_FORMATS.find((item) => item.value === aspectRatio);
	if (!format) return errorResponse('Unsupported aspect ratio', 400);
	const referenceBytes = await prepareReferenceImage(body.get('referenceImage'));
	if (referenceBytes instanceof Response) return referenceBytes;

	try {
		const prompt = edit ? edit.prompt : buildPrompt(text);
		const { image } = await generateImage({
			model: 'openai/gpt-image-2.5-flare',
			prompt: edit
				? { text: prompt, images: [edit.image] }
				: referenceBytes
					? { text: prompt, images: [referenceBytes] }
					: prompt,
			// OpenAI accepts custom pixel sizes rather than the SDK's aspectRatio option.
			size: edit ? `${edit.width}x${edit.height}` : `${format.width}x${format.height}`,
			providerOptions: { openai: { quality: 'high' } },
		});
		const { width, height } = await sharp(image.uint8Array).metadata();
		if (width !== (edit?.width ?? format.width) || height !== (edit?.height ?? format.height)) {
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
