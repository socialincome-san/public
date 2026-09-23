import { DefaultPageProps } from '@/app/[lang]/[region]';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getHomeStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.service';

import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function HomePage({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	const storyResult = await getStoryWithFallback<ISbStoryData<Page>>(getHomeStoryPath(), lang);

	if (!storyResult.success) {
		return notFound();
	}

	const story = storyResult.data;

	if (!story) {
		return notFound();
	}

	return (
		<PageContentType
			blok={story.content}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			searchParams={resolvedSearchParams}
			richtextButtonHeaderAction="createProgram"
		/>
	);
}
