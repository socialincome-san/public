export type GalleryImage = {
	id: string | number;
	prompt: string | null;
	media_type: string;
	created_at: string | null;
	imageUrl: string;
	previewUrl: string;
};

export type GalleryBatch = {
	images: GalleryImage[];
	hasMore: boolean;
};

export type GeneratedImage = {
	uint8Array: Uint8Array;
	mediaType: string;
};

export type StoredImage = {
	imageUrl: string;
	previewUrl: string;
};

export const imageDownloadUrl = (imageUrl: string) => {
	const url = new URL(imageUrl);
	url.searchParams.set('download', '1');
	return url.toString();
};

export const isGenerateResponse = (
	value: unknown,
): value is {
	error: string | null;
	imageUrl: string | null;
	previewUrl: string | null;
	mediaType: string | null;
	width: number | null;
	height: number | null;
} =>
	typeof value === 'object' &&
	value !== null &&
	'error' in value &&
	(value.error === null || typeof value.error === 'string') &&
	'imageUrl' in value &&
	(value.imageUrl === null || typeof value.imageUrl === 'string') &&
	'previewUrl' in value &&
	(value.previewUrl === null || typeof value.previewUrl === 'string') &&
	'mediaType' in value &&
	(value.mediaType === null || typeof value.mediaType === 'string') &&
	'width' in value &&
	(value.width === null || (typeof value.width === 'number' && Number.isInteger(value.width) && value.width > 0)) &&
	'height' in value &&
	(value.height === null || (typeof value.height === 'number' && Number.isInteger(value.height) && value.height > 0));

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
			(image.created_at === null || typeof image.created_at === 'string') &&
			'imageUrl' in image &&
			typeof image.imageUrl === 'string' &&
			'previewUrl' in image &&
			typeof image.previewUrl === 'string',
	);
