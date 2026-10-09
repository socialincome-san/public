import { loadProgramDetailPortalData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import type { ProgramStory } from '@/components/storyblok/program/program.types';
import { getProgramImages, getProgramPortalSlug, getProgramTitle } from '@/components/storyblok/program/program.utils';
import { StoryblokPreviewStory } from '@/components/storyblok/storyblok-preview-story';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getCommunityPanelDataAction } from '@/modules/community/community.actions';
import { getStoryWithFallbackAction } from '@/modules/storyblok-content/storyblok-content.actions';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewProgramPage = async ({ storyPath, lang, currency, previewRoutePath, searchParams }: Props) => {
	return await StoryblokPreviewStory<ProgramStory>({
		storyPath,
		lang,
		previewRoutePath,
		searchParams,
		loadStory: async (path, language) => {
			const storyResult = await getStoryWithFallbackAction<ProgramStory>({ storyPath: path, language });

			return storyResult.success ? storyResult.data : null;
		},
		renderStory: async (story) => {
			const programTitle = getProgramTitle(story.content);
			const portalSlug = getProgramPortalSlug(story.content);

			const [programDetailPortalData, communityResult] = await Promise.all([
				portalSlug ? loadProgramDetailPortalData(portalSlug) : {},
				getCommunityPanelDataAction({ page: story.content, language: lang, currency }),
			]);

			return (
				<ProgramDetail
					programDetailData={{
						title: programTitle,
						fullSlug: story.full_slug,
						heroImage: story.content.primaryImage,
						images: getProgramImages(story.content),
						description: story.content.description?.trim() || undefined,
						faq: story.content.faq,
						...programDetailPortalData,
					}}
					lang={lang}
					currency={currency}
					community={communityResult.success ? communityResult.data : null}
				/>
			);
		},
	});
};
