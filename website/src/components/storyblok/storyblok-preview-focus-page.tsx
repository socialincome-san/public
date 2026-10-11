import { FocusDetail } from '@/components/storyblok/focus/focus-detail';
import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCommunityPanelDataAction } from '@/modules/community/community.actions';
import { getFocusBySlugAction } from '@/modules/storyblok-content/storyblok-content.actions';

type Props = {
	storyPath: string;
	slug: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewFocusPage = async ({
	storyPath,
	slug,
	lang,
	currency,
	previewRoutePath,
	searchParams,
}: Props) => {
	return await StoryblokPreviewStory<FocusStory>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (_path, language) => {
			const storyResult = await getFocusBySlugAction({ slug, language });

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (focus) => {
			const communityResult = await getCommunityPanelDataAction({ page: focus.content, language: lang, currency });

			return (
				<FocusDetail
					focus={focus}
					lang={lang}
					currency={currency}
					searchParams={Promise.resolve(searchParams)}
					community={communityResult.success ? communityResult.data : null}
				/>
			);
		},
	});
};
