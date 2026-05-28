import { DefaultLayoutProps } from '@/app/[lang]/[region]';
import { ProgramsOverviewPage } from '@/components/storyblok/program/programs-overview-page';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { ISbStoryData } from '@storyblok/js';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function ProgramsOverviewRoute({ params }: DefaultLayoutProps) {
	const { lang, region } = await params;
	const overviewResult = await services.storyblok.getStoryWithFallback<ISbStoryData<ProgramOverview>>(
		`${NEW_WEBSITE_SLUG}/programs`,
		lang,
	);

	if (!overviewResult.success) {
		return notFound();
	}

	return (
		<ProgramsOverviewPage
			overview={overviewResult.data}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
		/>
	);
}
