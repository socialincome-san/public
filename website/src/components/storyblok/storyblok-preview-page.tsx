import PageContentType from '@/components/content-types/page';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewPage = ({ storyPath, lang, region, previewRoutePath, searchParams }: Props) => {
	return (
		<StoryblokPreviewStory
			storyPath={storyPath}
			lang={lang}
			previewRoutePath={previewRoutePath}
			searchParams={searchParams}
			loadStory={async (path, language) => {
				const storyResult = await services.storyblok.getStoryWithFallback<ISbStoryData<Page>>(path, language);

				return storyResult.success ? storyResult.data : null;
			}}
			renderStory={(story) => <PageContentType blok={story.content} lang={lang} region={region} />}
		/>
	);
};
