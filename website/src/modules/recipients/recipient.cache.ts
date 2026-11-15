import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './recipient.service';
import { RECIPIENT_CACHE_TAG, type RecipientStatusBreakdown, type RecipientStatusBreakdownScope } from './recipient.types';

export const getRecipientStatusBreakdown = async (
	scope: RecipientStatusBreakdownScope,
): Promise<Result<RecipientStatusBreakdown>> => {
	'use cache';
	cacheTag(RECIPIENT_CACHE_TAG);

	return cacheResult(service.getRecipientStatusBreakdown(scope));
};
