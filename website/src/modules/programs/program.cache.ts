import type { WebsiteCurrency } from '@/lib/i18n/utils';
import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as statsService from './program-stats.service';
import type { ProgramFinancesStatsInput } from './program.schemas';
import * as service from './program.service';
import {
	PROGRAM_CACHE_TAG,
	type ProgramDashboardStats,
	type ProgramFinancesDisplayAmounts,
	type PublicPreviewProgram,
	type PublicProgramDetails,
	type PublicProgramFilterDataMap,
	type PublicProgramStats,
	type PublicProgramStatsMap,
} from './program.types';

export const getPublicProgramFilterDataByPortalSlugs = async (
	portalSlugs: string[],
): Promise<Result<PublicProgramFilterDataMap>> => {
	'use cache';
	cacheTag(PROGRAM_CACHE_TAG);

	return cacheResult(service.getPublicProgramFilterDataByPortalSlugs(portalSlugs));
};

export const getPublicProgramStatsByProgramPortalSlugs = async (
	portalSlugs: string[],
): Promise<Result<PublicProgramStatsMap>> => {
	'use cache';
	cacheTag(PROGRAM_CACHE_TAG);

	return cacheResult(service.getPublicProgramStatsByProgramPortalSlugs(portalSlugs));
};

export const getPublicProgramStatsById = async (programId: string): Promise<Result<PublicProgramStats>> => {
	'use cache';
	cacheTag(PROGRAM_CACHE_TAG);

	return cacheResult(service.getPublicProgramStatsById(programId));
};

export const getProgramIdByPortalSlug = async (slug: string): Promise<Result<string>> => {
	'use cache';
	cacheTag(PROGRAM_CACHE_TAG);

	return cacheResult(service.getProgramIdByPortalSlug(slug));
};

export const getPublicProgramBySlug = async (slug: string): Promise<Result<PublicProgramDetails>> => {
	'use cache';
	cacheTag(PROGRAM_CACHE_TAG);

	return cacheResult(service.getPublicProgramBySlug(slug));
};

export const getPublicPreviewProgramBySlug = async (slug: string): Promise<Result<PublicPreviewProgram>> => {
	'use cache';
	cacheTag(PROGRAM_CACHE_TAG);

	return cacheResult(service.getPublicPreviewProgramBySlug(slug));
};

export const getProgramDashboardStats = async (programId: string): Promise<Result<ProgramDashboardStats>> => {
	'use cache';
	cacheTag(PROGRAM_CACHE_TAG);

	return cacheResult(statsService.getProgramDashboardStats(programId));
};

export const resolveProgramFinancesDisplayAmounts = async (
	stats: ProgramFinancesStatsInput,
): Promise<Result<Record<WebsiteCurrency, ProgramFinancesDisplayAmounts>>> => {
	'use cache';
	cacheTag(PROGRAM_CACHE_TAG);

	return cacheResult(statsService.resolveProgramFinancesDisplayAmounts(stats));
};
