import { StoryblokPreviewSyncer } from '@/components/storyblok/storyblok-preview-syncer';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { buildPreviewCacheKey, getPreviewCache } from '@/lib/storyblok-preview/preview-cache';
import { getStoryblokPreviewToken, verifyStoryblokPreviewToken } from '@/lib/storyblok-preview/preview-token';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

type Props<TStory> = {
	storyPath: string;
	lang: WebsiteLanguage;
	previewRoutePath: string;
	searchParams: Record<string, string | undefined>;
	loadStory: (storyPath: string, lang: WebsiteLanguage) => Promise<TStory | null>;
	renderStory: (story: TStory) => Promise<ReactNode> | ReactNode;
};

export const StoryblokPreviewStory = async <TStory,>({
	storyPath,
	lang,
	previewRoutePath,
	searchParams,
	loadStory,
	renderStory,
}: Props<TStory>) => {
	const isVisualEditor = !!searchParams._storyblok;
	let token: string | undefined;
	let timestamp: string | undefined;
	let cachedStory: TStory | undefined;

	if (isVisualEditor) {
		const previewToken = getStoryblokPreviewToken(searchParams);
		token = previewToken.token;
		timestamp = previewToken.timestamp;

		if (!verifyStoryblokPreviewToken(token, timestamp)) {
			return notFound();
		}

		if (token) {
			const cacheKey = buildPreviewCacheKey(token, previewRoutePath);
			cachedStory = getPreviewCache<TStory>(cacheKey);
		}
	}

	const story = cachedStory ?? (await loadStory(storyPath, lang));
	if (!story) {
		return notFound();
	}

	const renderedStory = await renderStory(story);
	if (!isVisualEditor || !token || !timestamp) {
		return renderedStory;
	}

	return (
		<>
			<StoryblokPreviewSyncer previewToken={token} previewTimestamp={timestamp} previewRoutePath={previewRoutePath} />
			{renderedStory}
		</>
	);
};
