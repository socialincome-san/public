import { DefaultPageProps } from '@/app/[lang]/[region]';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { getStoryWithFallback } from '@/lib/storyblok';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function HomePage({ params }: DefaultPageProps) {
	const { lang } = await params;

	const story = await getStoryWithFallback<ISbStoryData<Page>>('new-website', lang);

	if (!story) {
		return notFound();
	}

	return <PageContentType blok={story.content} />;
}
