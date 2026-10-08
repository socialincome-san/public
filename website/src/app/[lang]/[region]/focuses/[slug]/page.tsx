import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import type { SearchParamsPageProps } from '@/app/page-props';
import { FocusDetail } from '@/components/storyblok/focus/focus-detail';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { getFocusBySlug } from '@/modules/storyblok-content/storyblok-content.cache';
import { notFound } from 'next/navigation';

type FocusPageProps = DefaultLayoutPropsWithSlug & SearchParamsPageProps;

export default async function FocusPage({ params, searchParams }: FocusPageProps) {
	const { slug, lang, region } = await params;
	const focusResult = await getFocusBySlug(slug, lang);

	if (!focusResult.success) {
		return notFound();
	}

	const communityResult = await getCommunityPanelData(focusResult.data.content, lang, region);

	return (
		<FocusDetail
			focus={focusResult.data}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			searchParams={searchParams}
			community={communityResult.success ? communityResult.data : null}
		/>
	);
}
