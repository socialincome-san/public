import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramId } from '@/components/storyblok/program/program.utils';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

const getProgramStats = async (programId: string) => {
	const statsResult = await services.read.program.getPublicProgramStatsById(programId);

	return statsResult.success ? statsResult.data : undefined;
};

export const StoryblokPreviewProgramPage = async ({ storyPath, lang, previewRoutePath, searchParams }: Props) => {
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
			const programId = getProgramId(story.content);
			const stats = programId ? await getProgramStats(programId) : undefined;

			return (
				<ProgramDetail
					program={story}
					lang={lang}
					campaignsCount={stats?.campaignsCount}
					recipientsCount={stats?.recipientsCount}
				/>
			);
		},
	});
};
