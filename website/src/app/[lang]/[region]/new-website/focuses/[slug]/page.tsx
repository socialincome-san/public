import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { FocusDetail } from '@/components/storyblok/focus/focus-detail';
import { getFocusId } from '@/components/storyblok/focus/focus.utils';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function FocusPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang } = await params;
	const focusResult = await services.storyblok.getFocusBySlug(slug, lang);

	if (!focusResult.success) {
		return notFound();
	}

	const focusId = getFocusId(focusResult.data.content);
	const statsResult = focusId ? await services.read.focus.getPublicFocusStatsById(focusId) : undefined;
	const activeProgramsCount = statsResult?.success ? statsResult.data.programsCount : 0;
	const recipientsInProgramsCount = statsResult?.success ? statsResult.data.recipientsInProgramsCount : 0;
	const candidatesCount = statsResult?.success ? statsResult.data.candidatesCount : 0;

	return (
		<FocusDetail
			focus={focusResult.data}
			lang={lang as WebsiteLanguage}
			activeProgramsCount={activeProgramsCount}
			recipientsInProgramsCount={recipientsInProgramsCount}
			candidatesCount={candidatesCount}
		/>
	);
}
