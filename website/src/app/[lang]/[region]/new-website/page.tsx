import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { getStoryblokApi } from '@/lib/storyblok';
import type { ISbStoryData } from '@storyblok/js';
import { StoryblokStory } from '@storyblok/react/rsc';

export default async function HomePage({ params }: DefaultPageProps) {
	const { lang } = await params;

	const storyblokApi = getStoryblokApi();
	const response = await storyblokApi.getStory('new-website/home');
	const story = response.data.story as ISbStoryData<Page>;

	return <StoryblokStory story={story} />;
}
