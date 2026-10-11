import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import { loadProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import { toWebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;

	return getWebsiteAlternates(lang as WebsiteLanguage, `programs/${slug}`);
};

export default async function ProgramPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, currency } = await params;
	const programDetailData = await loadProgramDetailData(slug, lang);
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
