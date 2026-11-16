import { getPageMetadata } from '@/app/[lang]/[currency]/page-metadata';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { Community } from '@/components/community/community';
import { pickCommunityPage } from '@/components/community/pick-community-page';
import PageContentType from '@/components/content-types/page';
import { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { isFolderOverviewStoryblokSlug } from '@/lib/storyblok/storyblok-paths';
import { getPageStoryMetadata } from '@/lib/storyblok/storyblok-richtext';
import { getStoryblokMetadataImage, getTranslatedStoryName } from '@/lib/storyblok/storyblok-utils';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

type Props = {
	storyPath: string;
	lang: string;
	currency: string;
	searchParams: Promise<Record<string, string>>;
	// Rendered after the Storyblok blocks
	children?: ReactNode;
	// Names the folder crumb, which otherwise comes from its slug ("circle")
	folderBreadcrumb?: { label: string };
};

export const getContentPageMetadata = async (storyPath: string, lang: WebsiteLanguage, pathTail: string) => {
	const storyResult = await getStoryWithFallback<ISbStoryData<Page>>(storyPath, lang);
	if (!storyResult.success) {
		return getPageMetadata(lang, pathTail, {});
	}
	const { title: storyTitle, description, image } = getPageStoryMetadata(storyResult.data.content);
	const title = storyTitle ?? storyResult.data.name;

	return getPageMetadata(lang, pathTail, {
		title,
		description,
		...(image ? { image: getStoryblokMetadataImage(image, title) } : {}),
	});
};

export const ContentPage = async ({ storyPath, lang, currency, searchParams, children, folderBreadcrumb }: Props) => {
	const storyResult = await getStoryWithFallback<ISbStoryData<Page>>(storyPath, lang);

	if (!storyResult.success) {
		return notFound();
	}

	const story = storyResult.data;
	const title =
		typeof story.content.title === 'string'
			? story.content.title.trim()
			: (getTranslatedStoryName(story, lang) ?? story.name);
	// A folder's overview page (pages/circle/circle) is that folder, so the breadcrumb ends at the folder
	const isFolderOverview = isFolderOverviewStoryblokSlug(story.full_slug);
	const [builtBreadcrumbLinks, communityResult] = await Promise.all([
		buildBreadcrumbLinks({
			fullSlug: story.full_slug,
			currentLabel: title,
			lang: lang as WebsiteLanguage,
			currency: toWebsiteCurrency(currency),
			includeCurrentLabel: !isFolderOverview,
		}),
		getCommunityPanelData(pickCommunityPage(story.content), lang, toWebsiteCurrency(currency)),
	]);
	const community = communityResult.success ? communityResult.data : null;
	const folderCrumbIndex = builtBreadcrumbLinks.length - (isFolderOverview ? 1 : 2);
	const breadcrumbLinks = folderBreadcrumb
		? builtBreadcrumbLinks.map((link, index) =>
				index === folderCrumbIndex ? { ...link, label: folderBreadcrumb.label } : link,
			)
		: builtBreadcrumbLinks;

	return (
		<>
			<PageContentType
				blok={story.content}
				lang={lang as WebsiteLanguage}
				currency={toWebsiteCurrency(currency)}
				searchParams={searchParams}
				storyUuid={story.uuid}
				afterHero={
					<BlockWrapper marginTop="none" marginBottom="none">
						<div className="pt-9">
							<Breadcrumb
								links={breadcrumbLinks}
								layout="inline"
								aside={community ? <Community data={community} /> : null}
							/>
						</div>
					</BlockWrapper>
				}
			/>
			{children}
		</>
	);
};
