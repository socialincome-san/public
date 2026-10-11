import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './contributor.service';
import { CONTRIBUTOR_CACHE_TAG, type ContributorCommunityStats } from './contributor.types';

export const getCommunityStats = async (): Promise<Result<ContributorCommunityStats>> => {
	'use cache';
	cacheTag(CONTRIBUTOR_CACHE_TAG);

	return cacheResult(service.getCommunityStats());
};
