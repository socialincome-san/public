import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { StoryblokLiveStory } from '@/components/storyblok/storyblok-provider';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

const storyblokService = new StoryblokService();

export default async function PreviewPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang } = await params;

	const story = await storyblokService.getStoryWithFallback<ISbStoryData<Page>>(`new-website/${slug}`, lang);

	if (!story) {
		return notFound();
	}

	return <StoryblokLiveStory story={story} />;
}
