import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as publicService from './local-partner-public.service';
import * as service from './local-partner.service';
import {
	LOCAL_PARTNER_CACHE_TAG,
	type LocalPartnerDashboardStats,
	type LocalPartnerPrograms,
	type PublicLocalPartnerOverviewStatsMap,
	type PublicProgramLocalPartner,
} from './local-partner.types';

export const getPublicLocalPartnersByProgramId = async (programId: string): Promise<Result<PublicProgramLocalPartner[]>> => {
	'use cache';
	cacheTag(LOCAL_PARTNER_CACHE_TAG);

	return cacheResult(service.getPublicLocalPartnersByProgramId(programId));
};

export const getLocalPartnerDashboardStats = async (portalSlug?: string): Promise<Result<LocalPartnerDashboardStats>> => {
	'use cache';
	cacheTag(LOCAL_PARTNER_CACHE_TAG);

	return cacheResult(publicService.getLocalPartnerDashboardStats(portalSlug));
};

export const getLocalPartnerOverviewStats = async (
	portalSlugs: string[],
): Promise<Result<PublicLocalPartnerOverviewStatsMap>> => {
	'use cache';
	cacheTag(LOCAL_PARTNER_CACHE_TAG);

	return cacheResult(publicService.getLocalPartnerOverviewStats(portalSlugs));
};

export const getLocalPartnerProgramSummaries = async (
	lang: WebsiteLanguage,
	localPartnerPortalSlug: string,
	countryIsoCode: string,
): Promise<Result<LocalPartnerPrograms>> => {
	'use cache';
	cacheTag(LOCAL_PARTNER_CACHE_TAG);

	return cacheResult(publicService.getLocalPartnerProgramSummaries(lang, localPartnerPortalSlug, countryIsoCode));
};
