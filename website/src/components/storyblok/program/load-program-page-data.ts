import { getProgramId, getProgramTitle } from '@/components/storyblok/program/program.utils';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { PublicProgramDetails, PublicProgramStats } from '@/lib/services/program/program.types';
import type { ProgramDashboardStats } from '@/lib/services/program-stats/program-stats.types';
import { services } from '@/lib/services/services';
import { getProgramStoryPath, getProgramsOverviewStoryPath } from '@/lib/storyblok/storyblok-paths';
import type { ISbStoryData } from '@storyblok/js';

type ProgramDbData = {
	stats?: PublicProgramStats;
	dashboardStats?: ProgramDashboardStats;
	programDetails?: PublicProgramDetails;
};

type ProgramPageData = {
	title: string;
	fullSlug: string;
	heroImageFilename?: string;
	heroImageAlt?: string;
	description?: string;
} & ProgramDbData;

const loadProgramDbData = async (dbSlug: string): Promise<ProgramDbData> => {
	const programIdResult = await services.read.program.getProgramIdBySlug(dbSlug);
	if (!programIdResult.success) {
		return {};
	}

	const programId = programIdResult.data;
	const [statsResult, dashboardStatsResult, programDetailsResult] = await Promise.all([
		services.read.program.getPublicProgramStatsById(programId),
		services.programStats.getProgramDashboardStats(programId),
		services.read.program.getPublicProgramBySlug(dbSlug),
	]);

	return {
		stats: statsResult.success ? statsResult.data : undefined,
		dashboardStats: dashboardStatsResult.success ? dashboardStatsResult.data : undefined,
		programDetails: programDetailsResult.success ? programDetailsResult.data : undefined,
	};
};

export const loadProgramPageData = async (urlSlug: string, lang: string): Promise<ProgramPageData | null> => {
	const programResult = await services.storyblok.getProgramBySlug(urlSlug, lang);

	if (programResult.success) {
		const story = programResult.data;
		const dbSlug = getProgramId(story.content);
		const dbData = dbSlug ? await loadProgramDbData(dbSlug) : {};

		return {
			title: getProgramTitle(story.content),
			fullSlug: story.full_slug,
			heroImageFilename: story.content.primaryImage?.filename ?? undefined,
			heroImageAlt: story.content.primaryImage?.alt ?? undefined,
			description: story.content.description?.trim() || undefined,
			...dbData,
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
	const dbData = await loadProgramDbData(urlSlug);

	return {
		title: previewProgramResult.data.name,
		fullSlug: getProgramStoryPath(urlSlug),
		heroImageFilename: defaultImage?.filename ?? undefined,
		heroImageAlt: defaultImage?.alt ?? undefined,
		description: undefined,
		...dbData,
	};
};

export const loadProgramPageDataFromStory = async (story: ProgramStory): Promise<ProgramDbData> => {
	const dbSlug = getProgramId(story.content);
	if (!dbSlug) {
		return {};
	}

	return loadProgramDbData(dbSlug);
};
