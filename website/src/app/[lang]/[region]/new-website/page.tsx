import { DefaultPageProps } from '@/app/[lang]/[region]';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function HomePage({ params }: DefaultPageProps) {
	const { lang, region } = await params;

	const storyResult = await services.storyblok.getStoryWithFallback<ISbStoryData<Page>>(NEW_WEBSITE_SLUG, lang);

	if (!storyResult.success) {
		return notFound();
	}

	const story = storyResult.data;

	if (!story) {
		return notFound();
	}

	return <PageContentType blok={story.content} lang={lang as WebsiteLanguage} region={region as WebsiteRegion} />;
}
