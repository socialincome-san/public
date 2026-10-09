import { ProgramsOverviewPage } from '@/components/storyblok/program/programs-overview-page';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewProgramsOverviewPage = async ({
	storyPath,
	lang,
	currency,
	previewRoutePath,
	searchParams,
}: Props) => {
	return await StoryblokPreviewStory<ISbStoryData<ProgramOverview>>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await getStoryWithFallbackAction<ISbStoryData<ProgramOverview>>({
				storyPath: path,
				language,
			});

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: (overview) => (
			<ProgramsOverviewPage
				overview={overview}
				lang={lang}
				currency={currency}
				searchParams={Promise.resolve(searchParams)}
			/>
		),
	});
};
