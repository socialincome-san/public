import { DefaultLayoutPropsWithSlug, DefaultPageProps } from '@/app/[lang]/[region]';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { Community } from '@/components/community/community';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getPageStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getCommunityPanelData } from '@/modules/community/community.service';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.service';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function ContentPage({ params, searchParams }: DefaultLayoutPropsWithSlug & DefaultPageProps) {
	const { slug, lang, region } = await params;
	const resolvedSearchParams = await searchParams;

	const storyResult = await getStoryWithFallback<ISbStoryData<Page>>(getPageStoryPath(slug), lang);

	if (!storyResult.success) {
		return notFound();
	}

	const story = storyResult.data;
	const title = typeof story.content.title === 'string' ? story.content.title.trim() : story.name;
	const [breadcrumbLinks, communityResult] = await Promise.all([
		buildBreadcrumbLinks({
			fullSlug: story.full_slug,
			currentLabel: title,
			lang: lang as WebsiteLanguage,
			region: region as WebsiteRegion,
		}),
		getCommunityPanelData(story.content, lang, region),
	]);
	const community = communityResult.success ? communityResult.data : null;

	return (
		<PageContentType
			blok={story.content}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			searchParams={resolvedSearchParams}
			afterHero={
				<BlockWrapper disableMarginTop disableMarginBottom>
					<div className="pt-9">
						<Breadcrumb
							links={breadcrumbLinks}
							layout="inline"
							aside={community ? <Community data={community} lang={lang as WebsiteLanguage} /> : null}
						/>
					</div>
				</BlockWrapper>
			}
		/>
	);
}
