import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './contribution.service';
import { CONTRIBUTION_CACHE_TAG, type GlobeContribution } from './contribution.types';

export const getRecentSuccessfulContributions = async (days: number): Promise<Result<GlobeContribution[]>> => {
	'use cache';
	cacheTag(CONTRIBUTION_CACHE_TAG);

	return cacheResult(service.getRecentSuccessfulContributions(days));
};
