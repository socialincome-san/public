import { LocalPartnersOverviewPage } from '@/components/storyblok/local-partner/local-partners-overview-page';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import type { LocalPartnersOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewLocalPartnersOverviewPage = async ({
	storyPath,
	lang,
	region,
	previewRoutePath,
	searchParams,
}: Props) => {
	return await StoryblokPreviewStory<ISbStoryData<LocalPartnersOverview>>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await services.storyblok.getStoryWithFallback<ISbStoryData<LocalPartnersOverview>>(path, language);

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: (overview) => <LocalPartnersOverviewPage overview={overview} lang={lang} region={region} />,
	});
};
