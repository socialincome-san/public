import { CommunityRow } from '@/components/community/community-row';
import PageContentType from '@/components/content-types/page';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCommunityPanelDataAction } from '@/modules/community/community.actions';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewPage = async ({ storyPath, lang, currency, previewRoutePath, searchParams }: Props) => {
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
			const communityResult = await getCommunityPanelDataAction({ page: story.content, language: lang, currency });
			const community = communityResult.success ? communityResult.data : null;

			return (
				<PageContentType
					blok={story.content}
					lang={lang}
					currency={currency}
					afterHero={community ? <CommunityRow data={community} /> : null}
				/>
			);
		},
	});
};
