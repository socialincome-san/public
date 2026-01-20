import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { getStoryblokApi } from '@/lib/storyblok';
import type { ISbStoryData } from '@storyblok/js';
import { StoryblokStory } from '@storyblok/react/rsc';
import { notFound } from 'next/navigation';

export default async function HomePage({ params }: DefaultPageProps) {
	const { lang } = await params;

	const mask = (value: string | undefined) => (value ? `***${value.slice(-4)}` : 'MISSING');

	console.group('[Storyblok] ENV CONFIG');
	console.log('STORYBLOK_PREVIEW_TOKEN:', mask(process.env.STORYBLOK_PREVIEW_TOKEN));
	console.log('STORYBLOK_PREVIEW_SECRET:', mask(process.env.STORYBLOK_PREVIEW_SECRET));
	console.log('STORYBLOK_PERSONAL_ACCESS_TOKEN:', mask(process.env.STORYBLOK_PERSONAL_ACCESS_TOKEN));
	console.log('STORYBLOK_SPACE_ID:', mask(process.env.STORYBLOK_SPACE_ID));
	console.groupEnd();

	console.log('[Storyblok] lang:', lang);

	const storyblokApi = getStoryblokApi();

	console.time('[Storyblok] fetch new-website/home');
	try {
		const response = await storyblokApi.getStory('new-website/home');
		console.timeEnd('[Storyblok] fetch new-website/home');

		console.log('[Storyblok] fetch response:', JSON.stringify(response, null, 2));
		console.log('[Storyblok] fetched story slug:', response.data?.story?.full_slug ?? 'NONE');

		const story = response.data.story as ISbStoryData<Page>;

		if (!story) {
			console.warn('[Storyblok] Story is null -> NOT_FOUND');
			return notFound();
		}

		return <StoryblokStory story={story} />;
	} catch (error) {
		console.error('[Storyblok] fetch failed:', {
			error: error instanceof Error ? error.message : error,
		});
		return notFound();
	}
}
