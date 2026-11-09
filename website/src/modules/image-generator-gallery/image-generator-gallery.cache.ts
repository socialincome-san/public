import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './image-generator-gallery.service';
import { IMAGE_GENERATOR_GALLERY_CACHE_TAG, type ImageGeneratorGalleryImage } from './image-generator-gallery.types';

export const getImageGeneratorGallery = async (): Promise<Result<ImageGeneratorGalleryImage[]>> => {
	'use cache';
	cacheTag(IMAGE_GENERATOR_GALLERY_CACHE_TAG);

	return cacheResult(service.getImageGeneratorGallery());
};
