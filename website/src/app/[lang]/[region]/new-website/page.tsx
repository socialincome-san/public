import { DefaultPageProps } from '@/app/[lang]/[region]';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

// export const revalidate = 900;

const storyblokService = new StoryblokService();

export default async function HomePage({ params }: DefaultPageProps) {
	const { lang } = await params;

	const story = await storyblokService.getStoryWithFallback<ISbStoryData<Page>>(NEW_WEBSITE_SLUG, lang);

	if (!story) {
		console.log(`Story with slug ${NEW_WEBSITE_SLUG} not found for language ${lang}`);
		return notFound();
	}

	return <PageContentType blok={story.content} />;
}
