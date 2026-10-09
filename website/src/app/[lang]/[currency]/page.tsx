import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[currency]';
import { CommunityRow } from '@/components/community/community-row';
import { pickCommunityPage } from '@/components/community/pick-community-page';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getHomeStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutProps) =>
	getWebsiteAlternates((await params).lang as WebsiteLanguage, '');

export default async function HomePage({ params, searchParams }: DefaultPageProps) {
	const { lang, currency } = await params;

	const storyResult = await getStoryWithFallback<ISbStoryData<Page>>(getHomeStoryPath(), lang);

	if (!storyResult.success) {
		return notFound();
	}

	const story = storyResult.data;

	if (!story) {
		return notFound();
	}

	const communityResult = await getCommunityPanelData(pickCommunityPage(story.content), lang, toWebsiteCurrency(currency));
	const community = communityResult.success ? communityResult.data : null;

	return (
		<PageContentType
			blok={story.content}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			searchParams={searchParams}
			richtextButtonHeaderAction="createProgram"
			afterHero={community ? <CommunityRow data={community} /> : null}
		/>
	);
}
