import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as publicWebsiteService from './campaign-public-website.service';
import * as service from './campaign.service';
import {
	CAMPAIGN_CACHE_TAG,
	type CampaignCmsJoinWithStats,
	type CampaignPage,
	type CampaignPageContent,
	type CampaignReference,
	type PublicCampaignActivity,
} from './campaign.types';

export const getCampaignByPortalSlug = async (portalSlug: string): Promise<Result<CampaignPage>> => {
	'use cache';
	cacheTag(CAMPAIGN_CACHE_TAG);

	return cacheResult(service.getCampaignByPortalSlug(portalSlug));
};

export const getAllCampaignsForCmsJoinWithStats = async (options?: {
	activity?: PublicCampaignActivity;
}): Promise<Result<CampaignCmsJoinWithStats>> => {
	'use cache';
	cacheTag(CAMPAIGN_CACHE_TAG);

	return cacheResult(service.getAllCampaignsForCmsJoinWithStats(options));
};

export const getDefaultCampaignForProgram = async (programId: string): Promise<Result<CampaignReference>> => {
	'use cache';
	cacheTag(CAMPAIGN_CACHE_TAG);

	return cacheResult(service.getDefaultCampaignForProgram(programId));
};

export const getCampaignPageContent = async (
	lang: WebsiteLanguage,
	campaignFaqs?: unknown,
): Promise<Result<CampaignPageContent>> => {
	'use cache';
	cacheTag(CAMPAIGN_CACHE_TAG);

	return cacheResult(publicWebsiteService.getCampaignPageContent(lang, campaignFaqs));
};
