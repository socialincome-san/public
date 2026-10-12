import { cacheLife } from 'next/cache';
import { nowMs } from './now';

// Prerendering rejects reading the clock outside a cache, so pages that count up to today read it here and refresh daily.
export const getTodayMs = async () => {
	'use cache';
	cacheLife('days');

	return Promise.resolve(nowMs());
};
