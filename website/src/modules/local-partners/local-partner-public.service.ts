import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { resultOk, type Result } from '@/lib/result';
import { LOCAL_PARTNER_PROGRAM_ROWS, selectLocalPartnerProgramStories } from '@/lib/storyblok/local-partner-programs.utils';
import { getProgramPortalSlug, getProgramStoryblokSlug, getProgramTitle } from '@/lib/storyblok/program-story';
import { getDefaultCampaignForProgram } from '@/modules/campaigns/campaign.service';
import {
	getPublicProgramFilterDataByPortalSlugs,
	getPublicProgramStatsByProgramPortalSlugs,
} from '@/modules/programs/program.service';
import { getPrograms } from '@/modules/storyblok-content/storyblok-content.service';
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

// Snapshot of public production totals for local partner detail previews.
const developmentDashboardStatsByPortalSlug: Record<string, LocalPartnerDashboardStats> = {
	'reunion-freetown': {
		recipientsCount: 11,
		completedSurveysCount: 43,
	},
};

// Snapshot of public production totals for local design previews.
const developmentOverviewStatsByPortalSlug: PublicLocalPartnerOverviewStatsMap = {
	'the-ark-foundation': { recipientsCount: 20, candidatesCount: 27 },
	'rev-dr-karla-j-cooper-foundation': { recipientsCount: 30, candidatesCount: 67 },
	ephraim: { recipientsCount: 29, candidatesCount: 49 },
	'reunion-freetown': { recipientsCount: 11, candidatesCount: 0 },
	'we-yone-child-foundation': { recipientsCount: 80, candidatesCount: 87 },
	'united-polio-brothers-and-sisters': { recipientsCount: 34, candidatesCount: 82 },
	'rainbo-initiative': { recipientsCount: 60, candidatesCount: 142 },
	'lizard-earth': { recipientsCount: 100, candidatesCount: 0 },
	'help-a-mother-and-newborn-initiative': { recipientsCount: 34, candidatesCount: 75 },
	'one-village-partners': { recipientsCount: 44, candidatesCount: 58 },
	'freetown-city-council': { recipientsCount: 15, candidatesCount: 0 },
	'equal-rights-alliance': { recipientsCount: 36, candidatesCount: 70 },
	'reachout-salone': { recipientsCount: 36, candidatesCount: 0 },
	'jamil-nyanga-jaward': { recipientsCount: 49, candidatesCount: 254 },
	'aurora-foundation': { recipientsCount: 42, candidatesCount: 0 },
	'sierra-leone-association-of-ebola-survivors': { recipientsCount: 62, candidatesCount: 0 },
};

const developmentProgramDataByPortalSlug: Record<
	string,
	{ programId: string; countryIsoCode: string; recipientsCount: number; isFundraising?: boolean }
> = {
	'sierra-leone-core-program': { programId: 'program-si-core-sl', countryIsoCode: 'SL', recipientsCount: 9 },
	'financial-skills-for-women': {
		programId: 'program-si-women-support-sl',
		countryIsoCode: 'SL',
		recipientsCount: 9,
	},
	'skills-program': { programId: 'program-si-education-sl', countryIsoCode: 'SL', recipientsCount: 9 },
	'mother-and-newborn-program': { programId: 'program-mother-and-newborn', countryIsoCode: 'SL', recipientsCount: 5 },
	'gender-based-violence-program': {
		programId: 'program-gender-based-violence',
		countryIsoCode: 'SL',
		recipientsCount: 5,
	},
	'widow-program': { programId: 'program-widow', countryIsoCode: 'SL', recipientsCount: 5 },
	'ebola-survivors-program': { programId: 'program-ebola-survivors', countryIsoCode: 'SL', recipientsCount: 5 },
	'ghana-core-program': { programId: 'program-si-livelihood-gh', countryIsoCode: 'GH', recipientsCount: 20 },
	'cacao-farmers': { programId: 'program-si-education-gh', countryIsoCode: 'GH', recipientsCount: 12 },
	'ubi-for-artists': {
		programId: 'program-ubi-for-artists',
		countryIsoCode: 'GH',
		recipientsCount: 8,
		isFundraising: true,
	},
	'liberia-core-program': { programId: 'program-si-resilience-lr', countryIsoCode: 'LR', recipientsCount: 9 },
	'epilepsy-forward': { programId: 'program-si-health-lr', countryIsoCode: 'LR', recipientsCount: 5 },
	craftspeople: { programId: 'program-somaha-community-lr', countryIsoCode: 'LR', recipientsCount: 5 },
	'island-income': { programId: 'program-island-income', countryIsoCode: 'LR', recipientsCount: 5 },
};

// Snapshot of public production program assignments for local partner detail previews.
const developmentProgramRecipientCountsByLocalPartnerPortalSlug: Record<string, Record<string, number>> = {
	'reunion-freetown': { 'program-ubi-for-artists': 11 },
};

export const getLocalPartnerDashboardStats = async (portalSlug?: string): Promise<Result<LocalPartnerDashboardStats>> => {
	const normalizedSlug = portalSlug?.trim();
	if (!normalizedSlug) {
		return resultOk(emptyDashboardStats);
	}
	if (process.env.NODE_ENV === 'development' && developmentDashboardStatsByPortalSlug[normalizedSlug]) {
		return resultOk(developmentDashboardStatsByPortalSlug[normalizedSlug]);
	}

	const statsResult = await getPublicLocalPartnerDashboardStatsBySlug(normalizedSlug);

	return resultOk(statsResult.success ? statsResult.data : emptyDashboardStats);
};

export const getLocalPartnerOverviewStats = async (
	portalSlugs: string[],
): Promise<Result<PublicLocalPartnerOverviewStatsMap>> => {
	const statsResult = await getPublicLocalPartnerOverviewStatsBySlugs(portalSlugs);
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};

	if (process.env.NODE_ENV !== 'development') {
		return resultOk(statsByPortalSlug);
	}

	return resultOk(
		Object.fromEntries(
			[...new Set(portalSlugs)].map((portalSlug) => {
				const stats = statsByPortalSlug[portalSlug];
				const developmentStats = developmentOverviewStatsByPortalSlug[portalSlug];

				return [
					portalSlug,
					{
						recipientsCount: stats?.recipientsCount ?? developmentStats?.recipientsCount ?? 0,
						candidatesCount: stats?.candidatesCount ?? developmentStats?.candidatesCount ?? 0,
					},
				];
			}),
		),
	);
};

export const getLocalPartnerProgramSummaries = async (
	lang: WebsiteLanguage,
	localPartnerPortalSlug: string,
	countryIsoCode: string,
): Promise<Result<LocalPartnerPrograms>> => {
	const programsResult = await getPrograms(lang);
	if (!programsResult.success) {
		return resultOk(emptyPrograms);
	}

	const stories = programsResult.data.filter((story) => getProgramPortalSlug(story.content));
	const portalSlugs = [...new Set(stories.map((story) => getProgramPortalSlug(story.content)))];
	const [countsResult, filterDataResult, statsResult] = await Promise.all([
		getProgramRecipientCountsByLocalPartnerSlug(localPartnerPortalSlug),
		getPublicProgramFilterDataByPortalSlugs(portalSlugs),
		getPublicProgramStatsByProgramPortalSlugs(portalSlugs),
	]);
	const isDevelopment = process.env.NODE_ENV === 'development';
	const recipientsCountByProgramId = {
		...(countsResult.success ? countsResult.data : {}),
		...(isDevelopment ? (developmentProgramRecipientCountsByLocalPartnerPortalSlug[localPartnerPortalSlug] ?? {}) : {}),
	};
	const filterDataByPortalSlug = {
		...(isDevelopment ? developmentProgramDataByPortalSlug : {}),
		...(filterDataResult.success ? filterDataResult.data : {}),
	};
	const statsByPortalSlug = statsResult.success ? statsResult.data : {};
	const { stories: selectedStories, isPartnerScoped } = selectLocalPartnerProgramStories(
		stories,
		filterDataByPortalSlug,
		recipientsCountByProgramId,
		isDevelopment ? countryIsoCode : '',
	);
	const countedStories = selectedStories
		.map((story) => {
			const portalSlug = getProgramPortalSlug(story.content);
			const programId = filterDataByPortalSlug[portalSlug]?.programId;
			const partnerCount = programId !== undefined ? recipientsCountByProgramId[programId] : undefined;
			const statsCount = statsByPortalSlug[portalSlug]?.recipientsCount;
			const developmentCount = developmentProgramDataByPortalSlug[portalSlug]?.recipientsCount;

			return {
				story,
				portalSlug,
				programId,
				recipientsCount: partnerCount ?? (isDevelopment ? (statsCount ?? developmentCount) : statsCount) ?? 0,
			};
		})
		.sort((left, right) => right.recipientsCount - left.recipientsCount);
	const programs = await Promise.all(
		countedStories.slice(0, LOCAL_PARTNER_PROGRAM_ROWS).map(async (entry) => {
			const campaignResult = entry.programId ? await getDefaultCampaignForProgram(entry.programId) : null;
			const developmentIsFundraising = developmentProgramDataByPortalSlug[entry.portalSlug]?.isFundraising;

			return {
				programId: entry.programId ?? entry.portalSlug,
				title: getProgramTitle(entry.story.content),
				storyblokSlug: getProgramStoryblokSlug(entry.story),
				recipientsCount: entry.recipientsCount,
				isFundraising: campaignResult?.success
					? campaignResult.data.endDate.getTime() > Date.now()
					: isDevelopment && (developmentIsFundraising ?? false),
			};
		}),
	);

	return resultOk({
		programs,
		programCount: isPartnerScoped ? Object.keys(recipientsCountByProgramId).length : countedStories.length,
		recipientsTotal: isPartnerScoped
			? Object.values(recipientsCountByProgramId).reduce((total, count) => total + count, 0)
			: countedStories.reduce((total, entry) => total + entry.recipientsCount, 0),
		isPartnerScoped,
	});
};
