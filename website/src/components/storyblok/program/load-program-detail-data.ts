import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramPortalSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ProgramDashboardStats } from '@/lib/services/program-stats/program-stats.types';
import type { PublicProgramDetails, PublicProgramStats } from '@/lib/services/program/program.types';
import { services } from '@/lib/services/services';
import { getProgramStoryPath, getProgramsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoryData } from '@storyblok/js';

type ProgramDetailPortalData = {
	stats?: PublicProgramStats;
	dashboardStats?: ProgramDashboardStats;
	programDetails?: PublicProgramDetails;
};

export type ProgramDetailData = {
	title: string;
	fullSlug: string;
	heroImageFilename?: string;
	heroImageAlt?: string;
	description?: string;
} & ProgramDetailPortalData;

export const loadProgramDetailPortalData = async (portalSlug: string): Promise<ProgramDetailPortalData> => {
	const programIdResult = await services.read.program.getProgramIdByPortalSlug(portalSlug);
	if (!programIdResult.success) {
		return {};
	}

	const programId = programIdResult.data;
	const [statsResult, dashboardStatsResult, programDetailsResult] = await Promise.all([
		services.read.program.getPublicProgramStatsById(programId),
		services.programStats.getProgramDashboardStats(programId),
		services.read.program.getPublicProgramBySlug(portalSlug),
	]);

	return {
		stats: statsResult.success ? statsResult.data : undefined,
		dashboardStats: dashboardStatsResult.success ? dashboardStatsResult.data : undefined,
		programDetails: programDetailsResult.success ? programDetailsResult.data : undefined,
	};
};

export const loadProgramDetailData = async (urlSlug: string, lang: string): Promise<ProgramDetailData | null> => {
	const programResult = await services.storyblok.getProgramBySlug(urlSlug, lang);

	// If the program exists in storyblok, use the portalslug from storyblok to resolve the db entry
	if (programResult.success) {
		const story = programResult.data;
		const portalSlug = getProgramPortalSlug(story.content);
		const portalData = portalSlug ? await loadProgramDetailPortalData(portalSlug) : {};

		return {
			title: getProgramTitle(story.content),
			fullSlug: story.full_slug,
			heroImageFilename: story.content.primaryImage?.filename ?? undefined,
			heroImageAlt: story.content.primaryImage?.alt ?? undefined,
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
		heroImageFilename: defaultImage?.filename ?? undefined,
		heroImageAlt: defaultImage?.alt ?? undefined,
		description: undefined,
		...portalData,
	};
};
