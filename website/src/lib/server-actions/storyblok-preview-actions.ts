'use server';

import { buildPreviewCacheKey, setPreviewCache } from '@/lib/storyblok-preview/preview-cache';
import { verifyStoryblokPreviewToken } from '@/lib/storyblok-preview/preview-token';
import type { ISbStoryData } from '@storyblok/js';
import { revalidatePath } from 'next/cache';

type UpdateStoryblokPreviewActionParams = {
	story: ISbStoryData;
	previewToken: string;
	previewTimestamp: string;
	previewRoutePath: string;
};

export const updateStoryblokPreviewAction = ({
	story,
	previewToken,
	previewTimestamp,
	previewRoutePath,
}: UpdateStoryblokPreviewActionParams) => {
	if (!story || !previewToken || !previewTimestamp || !previewRoutePath) {
		return;
	}

	if (!verifyStoryblokPreviewToken(previewToken, previewTimestamp)) {
		return;
	}

	const cacheKey = buildPreviewCacheKey(previewToken, previewRoutePath);
	setPreviewCache(cacheKey, story);
	revalidatePath(previewRoutePath);
};
