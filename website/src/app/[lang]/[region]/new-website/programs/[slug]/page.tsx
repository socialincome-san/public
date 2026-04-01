import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { PreviewProgram } from '@/components/public-landing/preview-program';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import { getProgramId } from '@/components/storyblok/program/program.utils';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function ProgramPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang } = await params;
	const programResult = await services.storyblok.getProgramBySlug(slug, lang);

	if (programResult.success) {
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

	const previewProgramResult = await services.read.program.getPublicPreviewProgramBySlug(slug);
	if (!previewProgramResult.success) {
		return notFound();
	}

	const statsResult = await services.read.program.getPublicProgramStatsById(previewProgramResult.data.id);
	if (!statsResult.success) {
		return notFound();
	}

	return (
		<PreviewProgram
			title={previewProgramResult.data.name}
			lang={lang as WebsiteLanguage}
			campaignsCount={statsResult.data.campaignsCount}
			recipientsCount={statsResult.data.recipientsCount}
		/>
	);
}
