import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { loadProgramDetailData } from '@/components/storyblok/program/load-program-detail-data';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function ProgramPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const programDetailData = await loadProgramDetailData(slug, lang);

	if (!programDetailData) {
		return notFound();
	}

	return (
		<ProgramDetail programDetailData={programDetailData} lang={lang as WebsiteLanguage} region={region as WebsiteRegion} />
	);
}
