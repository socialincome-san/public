import { FocusDetail } from '@/components/storyblok/focus/focus-detail';
import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

type Props = {
	storyPath: string;
	slug: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewFocusPage = async ({
	storyPath,
	slug,
	lang,
	region,
	previewRoutePath,
	searchParams,
}: Props) => {
	return await StoryblokPreviewStory<FocusStory>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (_path, language) => {
			const storyResult = await services.storyblok.getFocusBySlug(slug, language);

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: (focus) => <FocusDetail focus={focus} lang={lang} region={region} />,
	});
};
