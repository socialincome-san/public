import { getStoredImage } from '@/lib/database';
import { parseImageComments } from '@/lib/image-comments';
import { generateAndSaveImage, imageErrorResponse } from '@/lib/image-generation';
import { isImageId } from '@/lib/images';
import { buildEditPrompt } from '@/lib/prompts';
import sharp from 'sharp';

export const POST = async (request: Request) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return imageErrorResponse('Invalid request.', 400);
	}
	if (typeof body !== 'object' || body === null || !('imageId' in body) || !('comments' in body)) {
		return imageErrorResponse('Invalid request.', 400);
	}

	const comments = parseImageComments(body.comments);
	if (!comments) return imageErrorResponse('Add 1–20 comments, each with a description.', 400);
	if (!isImageId(body.imageId)) return imageErrorResponse('Image not found.', 404);

	const stored = await getStoredImage(body.imageId);
	if (!stored) return imageErrorResponse('Image not found.', 404);

	// Normalize to PNG with the orientation the browser showed when the comments were placed.
	const original = await sharp(Buffer.from(stored.image_base64, 'base64')).autoOrient().png().toBuffer({
		resolveWithObject: true,
	});

	return generateAndSaveImage({
		prompt: buildEditPrompt(comments),
		images: [original.data],
		width: original.info.width,
		height: original.info.height,
	});
};
