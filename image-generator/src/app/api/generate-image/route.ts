import { buildPrompt } from '@/app/style-template';
import { saveImage } from '@/lib/database';
import { compositeImageEdit, MAX_EDIT_IMAGE_BYTES, prepareImageEdit } from '@/lib/image-edit';
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

const buildEditPrompt = (text: string, mode: 'remove' | 'change'): string => {
	const instructions =
		mode === 'remove'
			? 'Remove the objects in the masked area and reconstruct the surface or background that would naturally be behind them. Do not leave holes, cutouts or blank patches. Do not add replacement objects.'
			: 'Redraw or repair the selected detail according to the user instructions below. Keep the object intact and reconstruct a complete, continuous surface. Do not remove the selected detail or replace it with background unless the user explicitly requests that. Do not introduce holes, cutouts or blank patches.';
	return `Edit only the masked area of this image. The mask identifies where to paint; it is not a hole or an instruction to erase. Preserve the rest of the image, its composition, colors and watercolor style. Match the surrounding edges, perspective, lighting and watercolor texture so the edited area joins naturally with the original. ${instructions} User instructions: ${text}`;
};

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
	const editMode = body.get('editMode');
	const editImage = body.get('editImage');
	const selectionMask = body.get('selectionMask');
	const isEdit = editMode !== null || editImage !== null || selectionMask !== null;
	let edit: Awaited<ReturnType<typeof prepareImageEdit>> | undefined;
	if (isEdit) {
		if (
			(editMode !== 'remove' && editMode !== 'change') ||
			!(editImage instanceof File) ||
			!(selectionMask instanceof File)
		) {
			return errorResponse('Provide an image, selection and valid edit mode.', 400);
		}
		if (editImage.size > MAX_EDIT_IMAGE_BYTES || selectionMask.size > MAX_EDIT_IMAGE_BYTES) {
			return errorResponse('Image and selection must each be 20 MB or smaller.', 413);
		}
		const editReference = body.get('referenceImage');
		if (editReference instanceof File && editReference.size > 0) {
			return errorResponse('Reference images cannot be combined with area edits.', 400);
		}
		try {
			edit = await prepareImageEdit(editImage, selectionMask);
		} catch (error) {
			return errorResponse(error instanceof Error ? error.message : 'Invalid image selection.', 400);
		}
	}
	if (!text && editMode !== 'remove') return errorResponse('Please enter a prompt.', 400);
	const aspectRatio = body.get('aspectRatio') ?? DEFAULT_IMAGE_FORMAT.value;
	const format = IMAGE_FORMATS.find((item) => item.value === aspectRatio);
	if (!format) return errorResponse('Unsupported aspect ratio', 400);
	const referenceBytes = await prepareReferenceImage(body.get('referenceImage'));
	if (referenceBytes instanceof Response) return referenceBytes;

	try {
		const prompt = edit ? buildEditPrompt(text, editMode === 'remove' ? 'remove' : 'change') : buildPrompt(text);
		const { image } = await generateImage({
			model: 'openai/gpt-image-2.5-flare',
			prompt: edit
				? { text: prompt, images: [edit.image], mask: edit.mask }
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
		const result = edit
			? { base64: (await compositeImageEdit(edit, image.uint8Array)).toString('base64'), mediaType: 'image/png' }
			: image;
		await saveImage(prompt, result);
		return Response.json({ error: null, imageBase64: result.base64, mediaType: result.mediaType, width, height });
	} catch (error) {
		console.error('Image generation failed', error);
		return errorResponse('Image generation failed', 500);
	}
};

const errorResponse = (error: string, status: number) =>
	Response.json({ error, imageBase64: null, mediaType: null, width: null, height: null }, { status });
