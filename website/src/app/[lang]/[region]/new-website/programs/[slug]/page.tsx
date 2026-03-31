import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import { getProgramId } from '@/components/storyblok/program/program.utils';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function ProgramPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang } = await params;
	const programResult = await services.storyblok.getProgramBySlug(slug, lang);

	if (!programResult.success) {
		return notFound();
	}

	const programId = getProgramId(programResult.data.content);
	const statsResult = programId ? await services.read.program.getPublicProgramStatsById(programId) : undefined;

	return (
		<ProgramDetail
			program={programResult.data}
			lang={lang as WebsiteLanguage}
			campaignsCount={statsResult?.success ? statsResult.data.campaignsCount : undefined}
			recipientsCount={statsResult?.success ? statsResult.data.recipientsCount : undefined}
		/>
	);
}
