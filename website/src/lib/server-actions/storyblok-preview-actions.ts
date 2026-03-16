'use server';

import type { ServiceResult } from '@/lib/services/core/base.types';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
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

export const updateStoryblokPreviewAction = async ({
	story,
	previewToken,
	previewTimestamp,
	previewRoutePath,
}: UpdateStoryblokPreviewActionParams): Promise<ServiceResult<void>> => {
	if (!story || !previewToken || !previewTimestamp || !previewRoutePath) {
		return resultFail('Missing required preview parameters');
	}

	if (!verifyStoryblokPreviewToken(previewToken, previewTimestamp)) {
		return resultFail('Invalid preview token');
	}

	const cacheKey = buildPreviewCacheKey(previewToken, previewRoutePath);
	setPreviewCache(cacheKey, story);
	revalidatePath(previewRoutePath);
	await Promise.resolve();

	return resultOk(undefined);
};
