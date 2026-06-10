import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { loadProgramPageData } from '@/components/storyblok/program/load-program-page-data';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function ProgramPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const data = await loadProgramPageData(slug, lang);

	if (!data) {
		return notFound();
	}

	return (
		<ProgramDetail
			title={data.title}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			fullSlug={data.fullSlug}
			heroImageFilename={data.heroImageFilename}
			heroImageAlt={data.heroImageAlt ?? data.title}
			description={data.description}
			stats={data.stats}
			dashboardStats={data.dashboardStats}
			programDetails={data.programDetails}
		/>
	);
}
