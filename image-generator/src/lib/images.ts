export type GalleryImage = {
	id: string | number;
	prompt: string | null;
	media_type: string;
	created_at: string | null;
};

export type GalleryBatch = {
	images: GalleryImage[];
	hasMore: boolean;
};

export type GeneratedImage = {
	base64: string;
	mediaType: string;
};

export const isGenerateResponse = (
	value: unknown,
): value is {
	error: string | null;
	imageBase64: string | null;
	mediaType: string | null;
	width: number | null;
	height: number | null;
	cost: number | null;
} =>
	typeof value === 'object' &&
	value !== null &&
	'error' in value &&
	(value.error === null || typeof value.error === 'string') &&
	'imageBase64' in value &&
	(value.imageBase64 === null || typeof value.imageBase64 === 'string') &&
	'mediaType' in value &&
	(value.mediaType === null || typeof value.mediaType === 'string') &&
	'width' in value &&
	(value.width === null || (typeof value.width === 'number' && Number.isInteger(value.width) && value.width > 0)) &&
	'height' in value &&
	(value.height === null || (typeof value.height === 'number' && Number.isInteger(value.height) && value.height > 0)) &&
	'cost' in value &&
	(value.cost === null || (typeof value.cost === 'number' && Number.isFinite(value.cost) && value.cost >= 0));

export const isGalleryBatch = (value: unknown): value is GalleryBatch =>
	typeof value === 'object' &&
	value !== null &&
	'hasMore' in value &&
	typeof value.hasMore === 'boolean' &&
	'images' in value &&
	Array.isArray(value.images) &&
	value.images.every(
		(image: unknown) =>
			typeof image === 'object' &&
			image !== null &&
			'id' in image &&
			(typeof image.id === 'string' || typeof image.id === 'number') &&
			'prompt' in image &&
			(image.prompt === null || typeof image.prompt === 'string') &&
			'media_type' in image &&
			typeof image.media_type === 'string' &&
			'created_at' in image &&
			(image.created_at === null || typeof image.created_at === 'string'),
	);
