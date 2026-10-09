import type { WebsiteCurrency } from '@/lib/i18n/utils';
import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import type { CommunityPage } from './community.schemas';
import * as service from './community.service';
import { COMMUNITY_CACHE_TAG, type CommunityPanelData } from './community.types';

export const getCommunityPanelData = async (
	page: CommunityPage,
	language: string,
	currency: WebsiteCurrency,
): Promise<Result<CommunityPanelData | null>> => {
	'use cache';
	cacheTag(COMMUNITY_CACHE_TAG);

	return cacheResult(service.getCommunityPanelData(page, language, currency));
};
