import PageContentType from '@/components/content-types/page';
import { StoryblokPreviewSyncer } from '@/components/storyblok/storyblok-preview-syncer';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams: Record<string, string | undefined>;
};

export const StoryblokPreviewPage = async ({ storyPath, lang, region, searchParams }: Props) => {
	const isVisualEditor = !!searchParams['_storyblok'];
	const storyResult = await services.storyblok.getStoryWithFallback<ISbStoryData<Page>>(storyPath, lang);

	if (!storyResult.success) {
		return notFound();
	}

	const story = storyResult.data;

	if (!story) {
		return notFound();
	}

	if (isVisualEditor) {
		return <StoryblokPreviewSyncer initialStory={story} lang={lang} region={region} />;
	}

	return <PageContentType blok={story.content} lang={lang} region={region} />;
};
