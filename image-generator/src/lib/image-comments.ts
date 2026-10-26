import sharp from 'sharp';
import { MAX_COMMENT_IMAGE_BYTES, MAX_COMMENT_LENGTH, MAX_IMAGE_COMMENTS } from './image-comment-limits.ts';
import { IMAGE_FORMATS } from './image-formats.ts';

type ImageComment = { x: number; y: number; text: string };

const isImageComment = (value: unknown, width: number, height: number): value is ImageComment =>
	typeof value === 'object' &&
	value !== null &&
	'x' in value &&
	typeof value.x === 'number' &&
	Number.isFinite(value.x) &&
	value.x >= 0 &&
	value.x < width &&
	'y' in value &&
	typeof value.y === 'number' &&
	Number.isFinite(value.y) &&
	value.y >= 0 &&
	value.y < height &&
	'text' in value &&
	typeof value.text === 'string' &&
	value.text.trim().length > 0 &&
	value.text.length <= MAX_COMMENT_LENGTH;

export const prepareImageComments = async (image: File, serialized: string) => {
	if (image.size === 0 || image.size > MAX_COMMENT_IMAGE_BYTES) {
		throw new Error('Choose an image up to 20 MB.');
	}
	const source = sharp(await image.arrayBuffer(), { limitInputPixels: 4_000_000 });
	const metadata = await source.metadata();
	const { width, height } = metadata.autoOrient;
	if (
		!width ||
		!height ||
		!['png', 'jpeg', 'webp'].includes(metadata.format ?? '') ||
		(metadata.pages ?? 1) !== 1 ||
		!IMAGE_FORMATS.some((format) => format.width === width && format.height === height)
	) {
		throw new Error('Choose a generated image in a supported format.');
	}
	if (serialized.length > MAX_IMAGE_COMMENTS * (MAX_COMMENT_LENGTH * 6 + 200)) {
		throw new Error('Comments are too large.');
	}
	let comments: unknown;
	try {
		comments = JSON.parse(serialized);
	} catch {
		throw new Error('Invalid image comments.');
	}
	if (
		!Array.isArray(comments) ||
		comments.length === 0 ||
		comments.length > MAX_IMAGE_COMMENTS ||
		!comments.every((comment: unknown) => isImageComment(comment, width, height))
	) {
		throw new Error('Provide 1–20 comments with text and coordinates inside the original image.');
	}
	const instructions = comments.map((comment: ImageComment, index: number) => ({
		comment: index + 1,
		x: comment.x,
		y: comment.y,
		text: comment.text.trim(),
	}));
	return {
		// Match the orientation browsers display before interpreting comment coordinates.
		image: await source.autoOrient().png().toBuffer(),
		width,
		height,
		prompt: `Edit the supplied original image according to all of the following comments. Coordinates are exact original-image pixels, with origin (0, 0) at the top-left, x increasing rightward and y increasing downward. The image is ${width} pixels wide and ${height} pixels high. Each point identifies the object or area to change, not the extent of a mask. Infer the relevant area from the comment. Preserve unrelated areas, composition, colors and watercolor style. Do not draw comment pins, numbers or text on the result. Comments: ${JSON.stringify(instructions)}`,
	};
};
