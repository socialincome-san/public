import { DefaultLayoutPropsWithSlug, DefaultPageProps } from '@/app/[lang]/[currency]';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { Community } from '@/components/community/community';
import { pickCommunityPage } from '@/components/community/pick-community-page';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getPageStoryPath } from '@/lib/storyblok/storyblok-paths';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

import { getWebsiteAlternates } from '@/lib/utils/metadata';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;

	return getWebsiteAlternates(lang as WebsiteLanguage, slug);
};

export default async function ContentPage({ params, searchParams }: DefaultLayoutPropsWithSlug & DefaultPageProps) {
	const { slug, lang, currency } = await params;

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
			currency: toWebsiteCurrency(currency),
		}),
		getCommunityPanelData(pickCommunityPage(story.content), lang, toWebsiteCurrency(currency)),
	]);
	const community = communityResult.success ? communityResult.data : null;

	return (
		<PageContentType
			blok={story.content}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			searchParams={searchParams}
			afterHero={
				<BlockWrapper disableMarginTop disableMarginBottom>
					<div className="pt-9">
						<Breadcrumb links={breadcrumbLinks} layout="inline" aside={community ? <Community data={community} /> : null} />
					</div>
				</BlockWrapper>
			}
		/>
	);
}
