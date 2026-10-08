import { DefaultPageProps } from '@/app/[lang]/[region]';
import { CommunityRow } from '@/components/community/community-row';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getHomeStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export default async function HomePage({ params, searchParams }: DefaultPageProps) {
	const { lang, region } = await params;

	const storyResult = await getStoryWithFallback<ISbStoryData<Page>>(getHomeStoryPath(), lang);

	if (!storyResult.success) {
		return notFound();
	}

	const story = storyResult.data;

	if (!story) {
		return notFound();
	}

	const communityResult = await getCommunityPanelData(story.content, lang, region);
	const community = communityResult.success ? communityResult.data : null;

	return (
		<PageContentType
			blok={story.content}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			searchParams={searchParams}
			richtextButtonHeaderAction="createProgram"
			afterHero={community ? <CommunityRow data={community} /> : null}
		/>
	);
}
