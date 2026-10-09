import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './focus.service';
import { FOCUS_CACHE_TAG, type PublicFocusStatsBySlugMap } from './focus.types';

export const getPublicFocusStatsBySlugs = async (focusSlugs: string[]): Promise<Result<PublicFocusStatsBySlugMap>> => {
	'use cache';
	cacheTag(FOCUS_CACHE_TAG);

	return cacheResult(service.getPublicFocusStatsBySlugs(focusSlugs));
};
