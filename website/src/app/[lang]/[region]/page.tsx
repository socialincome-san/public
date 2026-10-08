import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Community } from '@/components/community/community';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getHomeStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getCommunityPanelData } from '@/modules/community/community.service';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.service';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
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

	const communityResult = await getCommunityPanelData(story.content, lang, region);
	const community = communityResult.success ? communityResult.data : null;

	return (
		<>
			{community ? (
				<BlockWrapper disableMarginTop disableMarginBottom>
					<div className="flex justify-end pt-9">
						<Community data={community} lang={lang as WebsiteLanguage} />
					</div>
				</BlockWrapper>
			) : null}
			<PageContentType
				blok={story.content}
				lang={lang as WebsiteLanguage}
				region={region as WebsiteRegion}
				searchParams={resolvedSearchParams}
				richtextButtonHeaderAction="createProgram"
			/>
		</>
	);
}
