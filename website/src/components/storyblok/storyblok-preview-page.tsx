import PageContentType from '@/components/content-types/page';
import { StoryblokPreviewSyncer } from '@/components/storyblok/storyblok-preview-syncer';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { buildPreviewCacheKey, getPreviewCache } from '@/lib/storyblok-preview/preview-cache';
import { getStoryblokPreviewToken, verifyStoryblokPreviewToken } from '@/lib/storyblok-preview/preview-token';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

const storyblokService = new StoryblokService();

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewPage = async ({ storyPath, lang, region, previewRoutePath, searchParams }: Props) => {
	const isVisualEditor = !!searchParams['_storyblok'];
	const storyResult = await storyblokService.getStoryWithFallback<ISbStoryData<Page>>(storyPath, lang);

	if (!storyResult.success) {
		return notFound();
	}

	const story = storyResult.data;

	if (!story) {
		return notFound();
	}

	if (isVisualEditor) {
		const { token, timestamp } = getStoryblokPreviewToken(searchParams);

		if (!verifyStoryblokPreviewToken(token, timestamp)) {
			return notFound();
		}

		let previewStory = story;

		if (token) {
			const cacheKey = buildPreviewCacheKey(token, previewRoutePath);
			const cachedStory = getPreviewCache<ISbStoryData<Page>>(cacheKey);

			if (cachedStory) {
				previewStory = cachedStory;
			}
		}

		return (
			<>
				{token && timestamp && (
					<StoryblokPreviewSyncer
						previewToken={token}
						previewTimestamp={timestamp}
						previewRoutePath={previewRoutePath}
					/>
				)}
				<PageContentType blok={previewStory.content} lang={lang} region={region} />
			</>
		);
	}

	return <PageContentType blok={story.content} lang={lang} region={region} />;
};
