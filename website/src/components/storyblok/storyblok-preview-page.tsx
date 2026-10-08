import { CommunityRow } from '@/components/community/community-row';
import PageContentType from '@/components/content-types/page';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCommunityPanelDataAction } from '@/modules/community/community.actions';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewPage = async ({ storyPath, lang, region, previewRoutePath, searchParams }: Props) => {
	return await StoryblokPreviewStory({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await getStoryWithFallbackAction<ISbStoryData<Page>>({
				storyPath: path,
				language,
			});

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const communityResult = await getCommunityPanelDataAction({ page: story.content, language: lang, region });
			const community = communityResult.success ? communityResult.data : null;

			return (
				<PageContentType
					blok={story.content}
					lang={lang}
					region={region}
					afterHero={community ? <CommunityRow data={community} lang={lang} /> : null}
				/>
			);
		},
	});
};
