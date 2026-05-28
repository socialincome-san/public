import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramDescription, getProgramId, getProgramTitle } from '@/components/storyblok/program/program.utils';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

const getProgramStats = async (programId: string) => {
	const statsResult = await services.read.program.getPublicProgramStatsById(programId);

	return statsResult.success ? statsResult.data : undefined;
};

export const StoryblokPreviewProgramPage = async ({ storyPath, lang, region, previewRoutePath, searchParams }: Props) => {
	return await StoryblokPreviewStory<ProgramStory>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await services.storyblok.getStoryWithFallback<ProgramStory>(path, language);

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const programTitle = getProgramTitle(story.content);
			const programId = getProgramId(story.content);
			const stats = programId ? await getProgramStats(programId) : undefined;

			return (
				<ProgramDetail
					title={programTitle}
					lang={lang}
					region={region}
					fullSlug={story.full_slug}
					heroImageFilename={story.content.primaryImage?.filename ?? undefined}
					heroImageAlt={story.content.primaryImage?.alt ?? programTitle}
					stats={stats}
				/>
			);
		},
	});
};
