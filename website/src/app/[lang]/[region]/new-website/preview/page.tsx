import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import PageContentType from '@/components/content-types/page';
import { StoryblokPreviewSyncer } from '@/components/storyblok/storyblok-preview-syncer';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

type PreviewPageProps = DefaultLayoutProps<DefaultParams & { slug: string }> & {
	searchParams: Promise<{
		_storyblok?: string;
		[key: string]: string | undefined;
	}>;
};

const storyblokService = new StoryblokService();

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
	const { slug, lang } = await params;
	const resolvedSearchParams = await searchParams;
	const isVisualEditor = !!resolvedSearchParams['_storyblok'];

	const story = await storyblokService.getStoryWithFallback<ISbStoryData<Page>>('new-website', lang);

	if (!story) {
		return notFound();
	}

	if (isVisualEditor) {
		return <StoryblokPreviewSyncer initialStory={story} />;
	}

	return <PageContentType blok={story.content} />;
}
