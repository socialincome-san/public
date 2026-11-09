'use server';

import type { Result } from '@/lib/result';
import { getImageGeneratorGallery } from './image-generator-gallery.cache';
import type { ImageGeneratorGalleryImage } from './image-generator-gallery.types';

export const getImageGeneratorGalleryAction = async (): Promise<Result<ImageGeneratorGalleryImage[]>> =>
	getImageGeneratorGallery();
