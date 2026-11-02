export type ImageGeneratorGalleryImage = {
	id: string | number;
	prompt: string | null;
	previewUrl: string;
	costUsd: number | null;
	createdAt: string | null;
};

export const IMAGE_GENERATOR_GALLERY_CACHE_TAG = 'image-generator-gallery';
