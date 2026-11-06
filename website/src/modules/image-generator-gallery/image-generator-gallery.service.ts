import { fetchImageGeneratorGallery } from '@/integrations/image-generator/image-generator.integration';
import type { Result } from '@/lib/result';
import type { ImageGeneratorGalleryImage } from './image-generator-gallery.types';

export const getImageGeneratorGallery = async (): Promise<Result<ImageGeneratorGalleryImage[]>> => {
	const result = await fetchImageGeneratorGallery();
	if (!result.success) {
		console.error('Loading image generator gallery failed', { error: result.error });
	}

	return result;
};
