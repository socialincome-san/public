import { FocusesOverviewPage } from '@/components/storyblok/focus/focuses-overview-page';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import type { FocusOverview } from '@/generated/storyblok/types/109655/storyblok-components';
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

export const StoryblokPreviewFocusesOverviewPage = async ({
	storyPath,
	lang,
	currency,
	previewRoutePath,
	searchParams,
}: Props) => {
	return await StoryblokPreviewStory<ISbStoryData<FocusOverview>>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await getStoryWithFallbackAction<ISbStoryData<FocusOverview>>({
				storyPath: path,
				language,
			});

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: (overview) => (
			<FocusesOverviewPage
				overview={overview}
				lang={lang}
				currency={currency}
				searchParams={Promise.resolve(searchParams)}
			/>
		),
	});
};
