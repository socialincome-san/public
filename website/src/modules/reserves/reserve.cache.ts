import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './reserve.service';
import { RESERVE_CACHE_TAG, type LatestReserves } from './reserve.types';

export const getLatestReserves = async (): Promise<Result<LatestReserves>> => {
	'use cache';
	cacheTag(RESERVE_CACHE_TAG);

	return cacheResult(service.getLatestReserves());
};
