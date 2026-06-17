import { getProgramPortalSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { PAYOUT_FORECAST_MONTHS_AHEAD } from '@/lib/services/payout/payout-forecast.constants';
import type { PayoutForecastTableView } from '@/lib/services/payout/payout.types';
import type { ProgramDashboardStats } from '@/lib/services/program-stats/program-stats.types';
import type { PublicProgramDetails, PublicProgramStats } from '@/lib/services/program/program.types';
import { services } from '@/lib/services/services';
import { getProgramStoryPath, getProgramsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoryData } from '@storyblok/js';
import { HeroHeaderImage } from '../shared/hero-header';

type ProgramDetailPortalData = {
	programId?: string;
	stats?: PublicProgramStats;
	dashboardStats?: ProgramDashboardStats;
	programDetails?: PublicProgramDetails;
	payoutForecast?: PayoutForecastTableView;
};

export type ProgramDetailData = {
	title: string;
	fullSlug: string;
	heroImage?: HeroHeaderImage | null;
	description?: string;
} & ProgramDetailPortalData;

export const loadProgramDetailPortalData = async (portalSlug: string): Promise<ProgramDetailPortalData> => {
	const programIdResult = await services.read.program.getProgramIdByPortalSlug(portalSlug);
	if (!programIdResult.success) {
		return {};
	}

	const programId = programIdResult.data;
	const [statsResult, dashboardStatsResult, programDetailsResult, payoutForecastResult] = await Promise.all([
		services.read.program.getPublicProgramStatsById(programId),
		services.programStats.getProgramDashboardStats(programId),
		services.read.program.getPublicProgramBySlug(portalSlug),
		services.read.payout.getPublicForecastTableView(programId, PAYOUT_FORECAST_MONTHS_AHEAD),
	]);

	return {
		programId,
		stats: statsResult.success ? statsResult.data : undefined,
		dashboardStats: dashboardStatsResult.success ? dashboardStatsResult.data : undefined,
		programDetails: programDetailsResult.success ? programDetailsResult.data : undefined,
		payoutForecast: payoutForecastResult.success ? payoutForecastResult.data : undefined,
	};
};

export const loadProgramDetailData = async (urlSlug: string, lang: string): Promise<ProgramDetailData | null> => {
	const programResult = await services.storyblok.getProgramBySlug(urlSlug, lang);

	if (programResult.success) {
		const story = programResult.data;
		const portalSlug = getProgramPortalSlug(story.content);
		const portalData = portalSlug ? await loadProgramDetailPortalData(portalSlug) : {};

		return {
			title: getProgramTitle(story.content),
			fullSlug: story.full_slug,
			heroImage: story.content.primaryImage,
			description: story.content.description?.trim() || undefined,
			...portalData,
		};
	}

	const [previewProgramResult, overviewResult] = await Promise.all([
		services.read.program.getPublicPreviewProgramBySlug(urlSlug),
		services.storyblok.getStoryWithFallback<ISbStoryData<ProgramOverview>>(getProgramsOverviewStoryPath(), lang),
	]);

	if (!previewProgramResult.success) {
		return null;
	}

	const defaultImage = overviewResult.success ? overviewResult.data.content.programDefaultImage : undefined;
	const portalData = await loadProgramDetailPortalData(urlSlug);

	return {
		title: previewProgramResult.data.name,
		fullSlug: getProgramStoryPath(urlSlug),
		heroImage: defaultImage,
		description: undefined,
		...portalData,
	};
};
