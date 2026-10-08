import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { loadProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { notFound } from 'next/navigation';

export default async function ProgramPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const programDetailData = await loadProgramDetailData(slug, lang);
	if (!programDetailData) {
		return notFound();
	}

	const communityResult = await getCommunityPanelData(programDetailData.communityPage ?? {}, lang, region);

	return (
		<ProgramDetail
			programDetailData={programDetailData}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			community={communityResult.success ? communityResult.data : null}
		/>
	);
}
