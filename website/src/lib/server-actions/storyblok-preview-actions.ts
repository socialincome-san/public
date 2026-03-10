'use server';

import { buildPreviewCacheKey, setPreviewCache } from '@/lib/storyblok-preview/preview-cache';
import type { ISbStoryData } from '@storyblok/js';
import { revalidatePath } from 'next/cache';

type UpdateStoryblokPreviewActionParams = {
	story: ISbStoryData;
	previewToken: string;
	previewRoutePath: string;
};

export const updateStoryblokPreviewAction = async ({
	story,
	previewToken,
	previewRoutePath,
}: UpdateStoryblokPreviewActionParams) => {
	if (!story || !previewToken || !previewRoutePath) {
		return;
	}

	const cacheKey = buildPreviewCacheKey(previewToken, previewRoutePath);
	setPreviewCache(cacheKey, story);
	revalidatePath(previewRoutePath);
};
