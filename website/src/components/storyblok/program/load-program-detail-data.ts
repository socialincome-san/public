import { getProgramImages, getProgramPortalSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import type { Program, ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
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
};

export type ProgramDetailData = {
	title: string;
	fullSlug: string;
	heroImage?: HeroHeaderImage | null;
	images?: StoryblokAsset[];
	description?: string;
	faq?: Program['faq'];
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
		programId,
		stats: statsResult.success ? statsResult.data : undefined,
		dashboardStats: dashboardStatsResult.success ? dashboardStatsResult.data : undefined,
		programDetails: programDetailsResult.success ? programDetailsResult.data : undefined,
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
			images: getProgramImages(story.content),
			description: story.content.description?.trim() || undefined,
			faq: story.content.faq,
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
