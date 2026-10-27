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

export type SavedImage = {
	id: GalleryImage['id'];
	width: number;
	height: number;
};

/** What the generate and edit routes return. */
export type ImageResponse = { image: SavedImage } | { error: string };

export const isImageId = (value: unknown): value is string =>
	typeof value === 'string' &&
	(/^[1-9][0-9]{0,18}$/.test(value) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

const IMAGE_VARIANTS = ['preview', 'original', 'transparent'] as const;
type ImageVariant = (typeof IMAGE_VARIANTS)[number];

export const isImageVariant = (value: string): value is ImageVariant => IMAGE_VARIANTS.some((variant) => variant === value);

export const imageUrl = (id: GalleryImage['id'], variant: ImageVariant, { download = false } = {}) => {
	const params = new URLSearchParams({ variant });
	if (download) {
		params.set('download', '1');
	}

	return `/api/gallery-images/${id}?${params}`;
};

const isPositiveInteger = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value > 0;

export const isImageResponse = (value: unknown): value is ImageResponse => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	if ('error' in value) {
		return typeof value.error === 'string';
	}

	return (
		'image' in value &&
		typeof value.image === 'object' &&
		value.image !== null &&
		'id' in value.image &&
		(typeof value.image.id === 'string' || typeof value.image.id === 'number') &&
		'width' in value.image &&
		isPositiveInteger(value.image.width) &&
		'height' in value.image &&
		isPositiveInteger(value.image.height)
	);
};

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
