import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import type { SearchParamsPageProps } from '@/app/page-props';
import { pickCommunityPage } from '@/components/community/pick-community-page';
import { FocusDetail } from '@/components/storyblok/focus/focus-detail';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { toWebsiteCurrency } from '@/lib/i18n/utils';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { getFocusBySlug } from '@/modules/storyblok-content/storyblok-content.cache';
import { notFound } from 'next/navigation';

type FocusPageProps = DefaultLayoutPropsWithSlug & SearchParamsPageProps;

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;

	return getWebsiteAlternates(lang as WebsiteLanguage, `focuses/${slug}`);
};

export default async function FocusPage({ params, searchParams }: FocusPageProps) {
	const { slug, lang, currency } = await params;
	const focusResult = await getFocusBySlug(slug, lang);

	if (!focusResult.success) {
		return notFound();
	}

	const communityResult = await getCommunityPanelData(
		pickCommunityPage(focusResult.data.content),
		lang,
		toWebsiteCurrency(currency),
	);

	return (
		<FocusDetail
			focus={focusResult.data}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			searchParams={searchParams}
			community={communityResult.success ? communityResult.data : null}
		/>
	);
}
