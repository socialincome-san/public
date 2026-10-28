import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import { getPageMetadata } from '@/app/[lang]/[currency]/page-metadata';
import { getPublishedSlugParams } from '@/app/[lang]/[currency]/published-slug-params';
import { loadProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getStoryblokMetadataImage } from '@/lib/storyblok/storyblok-utils';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { notFound } from 'next/navigation';
import { cache } from 'react';

const getProgramDetailData = cache(loadProgramDetailData);

export const generateStaticParams = () => getPublishedSlugParams('programs');

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;
	const programDetailData = await getProgramDetailData(slug, lang);

	return getPageMetadata(
		lang as WebsiteLanguage,
		`programs/${slug}`,
		programDetailData
			? {
					title: programDetailData.title,
					description: programDetailData.description,
					image: getStoryblokMetadataImage(programDetailData.heroImage, programDetailData.title),
				}
			: {},
	);
};

export default async function ProgramPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, currency } = await params;
	const programDetailData = await getProgramDetailData(slug, lang);
	if (!programDetailData) {
		return notFound();
	}

	const communityResult = await getCommunityPanelData(
		programDetailData.communityPage ?? {},
		lang,
		toWebsiteCurrency(currency),
	);

	return (
		<ProgramDetail
			programDetailData={programDetailData}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			community={communityResult.success ? communityResult.data : null}
		/>
	);
}
