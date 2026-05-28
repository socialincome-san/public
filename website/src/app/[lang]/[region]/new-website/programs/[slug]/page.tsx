import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { ProgramDetail } from '@/components/storyblok/program/program-detail';
import {
	getProgramDescription,
	getProgramId,
	getProgramTitle,
} from '@/components/storyblok/program/program.utils';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function ProgramPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang } = await params;
	const programResult = await services.storyblok.getProgramBySlug(slug, lang);

	if (programResult.success) {
		const program = programResult.data;
		const programTitle = getProgramTitle(program.content);
		const programId = getProgramId(program.content);
		const statsResult = programId ? await services.read.program.getPublicProgramStatsById(programId) : undefined;

		return (
			<ProgramDetail
				title={programTitle}
				description={getProgramDescription(program.content)}
				lang={lang as WebsiteLanguage}
				heroImageFilename={program.content.primaryImage?.filename ?? undefined}
				heroImageAlt={program.content.primaryImage?.alt ?? programTitle}
				campaignsCount={statsResult?.success ? statsResult.data.campaignsCount : undefined}
				recipientsCount={statsResult?.success ? statsResult.data.recipientsCount : undefined}
			/>
		);
	}

	const [previewProgramResult, overviewResult] = await Promise.all([
		services.read.program.getPublicPreviewProgramBySlug(slug),
		services.storyblok.getStoryWithFallback<ISbStoryData<ProgramOverview>>(
			`${NEW_WEBSITE_SLUG}/programs`,
			lang,
		),
	]);
	if (!previewProgramResult.success) {
		return notFound();
	}
	console.log("previewProgramResult", previewProgramResult);

	const statsResult = await services.read.program.getPublicProgramStatsById(previewProgramResult.data.id);
	console.log('statsResult', statsResult);
	if (!statsResult.success) {
		return notFound();
	}

	const programTitle = previewProgramResult.data.name;
	const defaultImage = overviewResult.success ? overviewResult.data.content.programDefaultImage : undefined;

	return (
		<ProgramDetail
			title={programTitle}
			description="-"
			lang={lang as WebsiteLanguage}
			heroImageFilename={defaultImage?.filename ?? undefined}
			heroImageAlt={defaultImage?.alt ?? programTitle}
			campaignsCount={statsResult?.success ? statsResult.data.campaignsCount : undefined}
			recipientsCount={statsResult.data.recipientsCount}
		/>
	);
}
