'use server';

import type { Result } from '@/lib/result';
import { getImageGeneratorGallery } from './image-generator-gallery.cache';
import { getImageGeneratorGallery as getUncachedImageGeneratorGallery } from './image-generator-gallery.service';
import type { ImageGeneratorGalleryImage } from './image-generator-gallery.types';

export const getImageGeneratorGalleryAction = async (): Promise<Result<ImageGeneratorGalleryImage[]>> =>
	process.env.NODE_ENV === 'development' ? getUncachedImageGeneratorGallery() : getImageGeneratorGallery();
