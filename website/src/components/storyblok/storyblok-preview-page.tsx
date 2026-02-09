import PageContentType from '@/components/content-types/page';
import { StoryblokPreviewSyncer } from '@/components/storyblok/storyblok-preview-syncer';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

const storyblokService = new StoryblokService();

type Props = {
	storyPath: string;
	lang: string;
	searchParams: Record<string, string | undefined>;
};

export async function StoryblokPreviewPage({ storyPath, lang, searchParams }: Props) {
	const isVisualEditor = !!searchParams['_storyblok'];
	const story = await storyblokService.getStoryWithFallback<ISbStoryData<Page>>(storyPath, lang);

	if (!story) {
		return notFound();
	}

	if (isVisualEditor) {
		return <StoryblokPreviewSyncer initialStory={story} />;
	}

	return <PageContentType blok={story.content} />;
}
