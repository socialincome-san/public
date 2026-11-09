import { DefaultLayoutProps, DefaultPageProps } from '@/app/[lang]/[currency]';
import { getPageMetadata } from '@/app/[lang]/[currency]/page-metadata';
import { CommunityRow } from '@/components/community/community-row';
import { pickCommunityPage } from '@/components/community/pick-community-page';
import PageContentType from '@/components/content-types/page';
import { JsonLd } from '@/components/structured-data/json-ld';
import { Layout, Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getHomeStoryPath, STORYBLOK_LAYOUT_PATH } from '@/lib/storyblok/storyblok-paths';
import { getPageStoryMetadata } from '@/lib/storyblok/storyblok-richtext';
import { getStoryblokMetadataImage } from '@/lib/storyblok/storyblok-utils';
import { getOrganizationStructuredData } from '@/lib/utils/structured-data';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { getStoryWithFallback } from '@/modules/storyblok-content/storyblok-content.cache';
import type { ISbStoryData } from '@storyblok/js';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const SOCIAL_PROFILE_ICONS = new Set(['instagram', 'linkedin', 'facebook', 'github', 'youtube']);

export const generateMetadata = async ({ params }: DefaultLayoutProps) => {
	const lang = (await params).lang as WebsiteLanguage;
	const [t, storyResult] = await Promise.all([
		getTranslations({ locale: lang, namespace: 'website-common' }),
		getStoryWithFallback<ISbStoryData<Page>>(getHomeStoryPath(), lang),
	]);

	const homeTitle = t('metadata.home-title');
	const { title, description, image } = storyResult.success
		? getPageStoryMetadata(storyResult.data.content, homeTitle)
		: { title: homeTitle, description: undefined, image: undefined };

	return getPageMetadata(lang, '', {
		title,
		description,
		...(image ? { image: getStoryblokMetadataImage(image, title) } : {}),
	});
};

// The footer's social links are the organization's profiles.
const getSocialProfileUrls = async (lang: string) => {
	const layoutResult = await getStoryWithFallback<ISbStoryData<Layout>>(STORYBLOK_LAYOUT_PATH, lang);
	const items = layoutResult.success ? layoutResult.data.content.footerMenu.flatMap((group) => group.items ?? []) : [];

	return items.flatMap((item) =>
		item.icon && SOCIAL_PROFILE_ICONS.has(item.icon) && item.link?.linktype === 'url' && item.link.url
			? [item.link.url]
			: [],
	);
};

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

	const [communityResult, socialProfileUrls] = await Promise.all([
		getCommunityPanelData(pickCommunityPage(story.content), lang, toWebsiteCurrency(currency)),
		getSocialProfileUrls(lang),
	]);
	const community = communityResult.success ? communityResult.data : null;

	return (
		<>
			<JsonLd data={getOrganizationStructuredData(socialProfileUrls)} />
			<PageContentType
				blok={story.content}
				lang={lang as WebsiteLanguage}
				currency={toWebsiteCurrency(currency)}
				searchParams={searchParams}
				richtextButtonHeaderAction="createProgram"
				afterHero={community ? <CommunityRow data={community} /> : null}
			/>
		</>
	);
}
