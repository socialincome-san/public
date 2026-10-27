// Imports nothing, so `node --test` can run its tests without a bundler.

export const MAX_IMAGE_COMMENTS = 20;
export const MAX_COMMENT_LENGTH = 2000;

/** `x` and `y` are fractions of the image size (0–1), measured from the top-left corner. */
type ImageComment = { x: number; y: number; text: string };

const isFraction = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;

const isImageComment = (value: unknown): value is ImageComment =>
	typeof value === 'object' &&
	value !== null &&
	'x' in value &&
	isFraction(value.x) &&
	'y' in value &&
	isFraction(value.y) &&
	'text' in value &&
	typeof value.text === 'string' &&
	value.text.trim() !== '' &&
	value.text.length <= MAX_COMMENT_LENGTH;

/** Returns the trimmed comments, or null when the request does not hold 1–20 valid ones. */
export const parseImageComments = (value: unknown): ImageComment[] | null => {
	if (!Array.isArray(value) || value.length === 0 || value.length > MAX_IMAGE_COMMENTS) {
		return null;
	}
	if (!value.every(isImageComment)) {
		return null;
	}

	return value.map(({ x, y, text }) => ({ x, y, text: text.trim() }));
};
