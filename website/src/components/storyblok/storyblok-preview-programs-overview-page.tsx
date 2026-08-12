import { ProgramsOverviewPage } from '@/components/storyblok/program/programs-overview-page';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewProgramsOverviewPage = async ({ storyPath, lang, previewRoutePath, searchParams }: Props) => {
	return await StoryblokPreviewStory<ISbStoryData<ProgramOverview>>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await services.storyblok.getStoryWithFallback<ISbStoryData<ProgramOverview>>(path, language);

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: (overview) => <ProgramsOverviewPage overview={overview} searchParams={searchParams} />,
	});
};
