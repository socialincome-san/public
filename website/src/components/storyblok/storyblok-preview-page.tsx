import PageContentType from '@/components/content-types/page';
import { StoryblokPreviewSyncer } from '@/components/storyblok/storyblok-preview-syncer';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

const storyblokService = new StoryblokService();

type Props = {
	storyPath: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams: Record<string, string | undefined>;
};

export async function StoryblokPreviewPage({ storyPath, lang, region, searchParams }: Props) {
	const isVisualEditor = !!searchParams['_storyblok'];
	const story = await storyblokService.getStoryWithFallback<ISbStoryData<Page>>(storyPath, lang);

	if (!story) {
		return notFound();
	}

	if (isVisualEditor) {
		return <StoryblokPreviewSyncer initialStory={story} lang={lang} region={region} />;
	}

	return <PageContentType blok={story.content} lang={lang} region={region} />;
}
