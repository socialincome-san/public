import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { resultOk, type Result } from '@/lib/result';
import { LOCAL_PARTNER_PROGRAM_ROWS, selectLocalPartnerProgramStories } from '@/lib/storyblok/local-partner-programs.utils';
import { getProgramPortalSlug, getProgramStoryblokSlug, getProgramTitle } from '@/lib/storyblok/program-story';
import { getDefaultCampaignForProgram } from '@/modules/campaigns/campaign.service';
import { getPublicProgramFilterDataByPortalSlugs } from '@/modules/programs/program.service';
import { getPrograms } from '@/modules/storyblok-content/storyblok-content.cache';
import {
	getProgramRecipientCountsByLocalPartnerSlug,
	getPublicLocalPartnerDashboardStatsBySlug,
	getPublicLocalPartnerOverviewStatsBySlugs,
} from './local-partner.service';
import type {
	LocalPartnerDashboardStats,
	LocalPartnerPrograms,
	PublicLocalPartnerOverviewStatsMap,
} from './local-partner.types';

const emptyDashboardStats: LocalPartnerDashboardStats = {
	recipientsCount: 0,
	completedSurveysCount: 0,
};

const emptyPrograms: LocalPartnerPrograms = {
	programs: [],
	programCount: 0,
	recipientsTotal: 0,
	isPartnerScoped: false,
};

export const getLocalPartnerDashboardStats = async (portalSlug?: string): Promise<Result<LocalPartnerDashboardStats>> => {
	const normalizedSlug = portalSlug?.trim();
	if (!normalizedSlug) {
		return resultOk(emptyDashboardStats);
	}

	const statsResult = await getPublicLocalPartnerDashboardStatsBySlug(normalizedSlug);

	return resultOk(statsResult.success ? statsResult.data : emptyDashboardStats);
};

export const getLocalPartnerOverviewStats = async (
	portalSlugs: string[],
): Promise<Result<PublicLocalPartnerOverviewStatsMap>> => {
	const statsResult = await getPublicLocalPartnerOverviewStatsBySlugs(portalSlugs);

	return resultOk(statsResult.success ? statsResult.data : {});
};

export const getLocalPartnerProgramSummaries = async (
	lang: WebsiteLanguage,
	localPartnerPortalSlug: string,
): Promise<Result<LocalPartnerPrograms>> => {
	const programsResult = await getPrograms(lang);
	if (!programsResult.success) {
		return resultOk(emptyPrograms);
	}

	const stories = programsResult.data.filter((story) => getProgramPortalSlug(story.content));
	const portalSlugs = [...new Set(stories.map((story) => getProgramPortalSlug(story.content)))];
	const [countsResult, filterDataResult] = await Promise.all([
		getProgramRecipientCountsByLocalPartnerSlug(localPartnerPortalSlug),
		getPublicProgramFilterDataByPortalSlugs(portalSlugs),
	]);
	const recipientsCountByProgramId = countsResult.success ? countsResult.data : {};
	const filterDataByPortalSlug = filterDataResult.success ? filterDataResult.data : {};
	const { stories: selectedStories, isPartnerScoped } = selectLocalPartnerProgramStories(
		stories,
		filterDataByPortalSlug,
		recipientsCountByProgramId,
	);
	const countedStories = selectedStories
		.map((story) => {
			const programId = filterDataByPortalSlug[getProgramPortalSlug(story.content)]?.programId;

			return {
				story,
				programId,
				recipientsCount: (programId !== undefined ? recipientsCountByProgramId[programId] : undefined) ?? 0,
			};
		})
		.sort((left, right) => right.recipientsCount - left.recipientsCount);
	const programs = await Promise.all(
		countedStories.slice(0, LOCAL_PARTNER_PROGRAM_ROWS).map(async (entry) => {
			const campaignResult = entry.programId ? await getDefaultCampaignForProgram(entry.programId) : null;

			return {
				programId: entry.programId ?? getProgramPortalSlug(entry.story.content),
				title: getProgramTitle(entry.story.content),
				storyblokSlug: getProgramStoryblokSlug(entry.story),
				recipientsCount: entry.recipientsCount,
				isFundraising: campaignResult?.success ? campaignResult.data.endDate.getTime() > Date.now() : false,
			};
		}),
	);

	return resultOk({
		programs,
		programCount: Object.keys(recipientsCountByProgramId).length,
		recipientsTotal: Object.values(recipientsCountByProgramId).reduce((total, count) => total + count, 0),
		isPartnerScoped,
	});
};
