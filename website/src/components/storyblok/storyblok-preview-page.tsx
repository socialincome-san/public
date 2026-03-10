import PageContentType from '@/components/content-types/page';
import { StoryblokPreviewSyncer } from '@/components/storyblok/storyblok-preview-syncer';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { buildPreviewCacheKey, getPreviewCache } from '@/lib/storyblok-preview/preview-cache';
import { getStoryblokPreviewToken, verifyStoryblokPreviewToken } from '@/lib/storyblok-preview/preview-token';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewPage = async ({ storyPath, lang, region, previewRoutePath, searchParams }: Props) => {
	const isVisualEditor = !!searchParams['_storyblok'];
	const storyResult = await services.storyblok.getStoryWithFallback<ISbStoryData<Page>>(storyPath, lang);
	let token: string | undefined;
	let timestamp: string | undefined;
	let cachedStory: ISbStoryData<Page> | undefined;

	if (isVisualEditor) {
		const previewToken = getStoryblokPreviewToken(searchParams);
		token = previewToken.token;
		timestamp = previewToken.timestamp;

		if (!verifyStoryblokPreviewToken(token, timestamp)) {
			return notFound();
		}

		if (token) {
			const cacheKey = buildPreviewCacheKey(token, previewRoutePath);
			cachedStory = getPreviewCache<ISbStoryData<Page>>(cacheKey);
		}
	}

	if (cachedStory) {
		return (
			<>
				{token && timestamp && (
					<StoryblokPreviewSyncer
						previewToken={token}
						previewTimestamp={timestamp}
						previewRoutePath={previewRoutePath}
					/>
				)}
				<PageContentType blok={cachedStory.content} lang={lang} region={region} />
			</>
		);
	}

	const storyResult = await storyblokService.getStoryWithFallback<ISbStoryData<Page>>(storyPath, lang);

	if (!storyResult.success) {
		return notFound();
	}

	const story = storyResult.data;

	if (!story) {
		return notFound();
	}

	if (isVisualEditor) {
		return (
			<>
				{token && timestamp && (
					<StoryblokPreviewSyncer
						previewToken={token}
						previewTimestamp={timestamp}
						previewRoutePath={previewRoutePath}
					/>
				)}
				<PageContentType blok={story.content} lang={lang} region={region} />
			</>
		);
	}

	return <PageContentType blok={story.content} lang={lang} region={region} />;
};
