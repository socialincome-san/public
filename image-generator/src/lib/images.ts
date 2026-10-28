export type GalleryImage = {
	id: string | number;
	prompt: string | null;
	media_type: string;
	created_at: string | null;
	imageUrl: string;
	previewUrl: string;
	cost_usd: number | null;
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

export type SavedImage = GalleryImage & {
	width: number;
	height: number;
};

/** What the generate and edit routes return. */
export type ImageResponse = { image: SavedImage } | { error: string };

export const isImageId = (value: unknown): value is string =>
	typeof value === 'string' &&
	(/^[1-9][0-9]{0,18}$/.test(value) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

export const imageUrl = (id: GalleryImage['id'], { download = false } = {}) => {
	const params = new URLSearchParams({ variant: 'transparent' });
	if (download) {
		params.set('download', '1');
	}

	return `/api/gallery-images/${id}?${params}`;
};

const isPositiveInteger = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value > 0;

const isGalleryImage = (value: unknown): value is GalleryImage =>
	typeof value === 'object' &&
	value !== null &&
	'id' in value &&
	(typeof value.id === 'string' || typeof value.id === 'number') &&
	'prompt' in value &&
	(value.prompt === null || typeof value.prompt === 'string') &&
	'media_type' in value &&
	typeof value.media_type === 'string' &&
	'created_at' in value &&
	(value.created_at === null || typeof value.created_at === 'string') &&
	'imageUrl' in value &&
	typeof value.imageUrl === 'string' &&
	'previewUrl' in value &&
	typeof value.previewUrl === 'string' &&
	'cost_usd' in value &&
	(value.cost_usd === null ||
		(typeof value.cost_usd === 'number' && Number.isFinite(value.cost_usd) && value.cost_usd >= 0));

export const isImageResponse = (value: unknown): value is ImageResponse => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	if ('error' in value) {
		return typeof value.error === 'string';
	}

	return (
		'image' in value &&
		isGalleryImage(value.image) &&
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
	value.images.every(isGalleryImage);
